import httpx
import asyncio
from typing import List, Optional
from core.config import settings
from schemas.youcontrol_schema import CheckResult
from dateutil import parser

# Ключ беремо з конфігу
API_KEY = settings.YOUCONTROL_API_KEY
BASE_URL = "https://api.youscore.com.ua/v1"
HEADERS = {
    "apiKey": API_KEY,
    "Accept": "application/json"
}

ENDPOINTS_CONFIG = {
    # --- НАЦБЕЗПЕКА  ---

    "/individualsSsuWantedAndTraitorPersons": {
        "name": "СБУ: Зрадники та Розшук",
        "is_two_step": True,
        "detail_template": "/individualsSsuWantedAndTraitorPersons/{id}",
        "id_field": "resultId"  # тут ID лежить у полі resultId
    },
    "/nacpwarsanctions": {
        "name": "База 'Війна і Санкції' (НАЗК)",
        "is_two_step": False,  # Повертає дані одразу
    },
    "/generalprosecutor24febsuspect": {
        "name": "Підозрювані (справи '24 лютого')",
        "is_two_step": False,
    },
    "/myrotvorets": {
        "name": "Центр 'Миротворець'",
        "is_two_step": False,
    },
    "/individualsRnboSanctions": {
        "name": "Санкції РНБО",
        "is_two_step": True,
        "detail_template": "/individualsRnboSanctions/{id}",
        "id_field": "resultId"
    },
    "/individualsGlobalSanctionsLists": {
        "name": "Міжнародні Санкції",
        "is_two_step": False,
    },

    # --- ЗАКОН ТА КОРУПЦІЯ ---

    "/corruptedPersons": {
        "name": "Реєстр корупціонерів",
        "is_two_step": True,
        "detail_template": "/corruptedPersons/{id}",
        "id_field": "resultId"
    },
    "/wantedOrDisappearedPersons": {
        "name": "Розшук МВС",
        "is_two_step": False,
        # Примітка: Існує метод отримання фото по ID, але текстові дані
        # (стаття, дата зникнення) приходять одразу в першому запиті.
        # Тому ставимо False, щоб економити запити.
    },
    "/lustratedPersons": {
        "name": "Люстровані особи",
        "is_two_step": False,  # Повертає об'єкт з даними одразу
    },
    "/individualsCourtCasesToBeHeard": {
        "name": "Суди: Призначені до розгляду",
        "is_two_step": True,
        "detail_template": "/individualsCourtCasesToBeHeard/{id}",
        "id_field": "resultId"
    },

    # --- ЗВ'ЯЗКИ (Конфлікт інтересів) ---

    "/individualsRelatedPersons": {
        "name": "Зв'язки (Компанії та ФОП)",
        "is_two_step": True,
        "detail_template": "/individualsRelatedPersons/{id}",
        "id_field": "resultId"
    }
}


async def check_candidate(
        surname: str,
        name: str,
        patronymic: str = None,
        birth_date: Optional[str] = None  # 1. Додаємо аргумент дати
) -> List[CheckResult]:
    print("HELLO YOUCONTROL")
    # Параметри для запиту (YouControl очікує саме такі ключі)
    if patronymic is not None:
        params = {
            "surname": surname,
            "firstname": name,
            "patronymic": patronymic
        }
    else:
        params = {
            "surname": surname,
            "firstname": name,
        }

    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [
            _fetch(
                client=client,
                endpoint=endpoint,
                params=params,
                config=config,  # 2. Передаємо весь конфіг, а не просто назву
                candidate_birth_date=birth_date  # 3. Передаємо дату для Smart Filter
            )
            for endpoint, config in ENDPOINTS_CONFIG.items()
        ]

        results = await asyncio.gather(*tasks)

    # 4. Фільтрація для LLM
    # Повертаємо тільки ті результати, де match_found = True.
    return [res for res in results if res.match_found]


async def _fetch(
        client: httpx.AsyncClient,
        endpoint: str,
        params: dict,
        config: dict,
        candidate_birth_date: Optional[str] = None  # Новий аргумент (формат 'YYYY-MM-DD' або 'YYYY')
) -> CheckResult:
    source_name = config["name"]

    try:
        # КРОК 1: Первинний пошук
        response = await client.get(f"{BASE_URL}{endpoint}", params=params, headers=HEADERS)

        if response.status_code != 200:
            return CheckResult(source_name=source_name, match_found=False, details_count=0, raw_data=[])

        data = response.json()

        # Нормалізація
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict) and data:
            items = [data]

        if not items:
            return CheckResult(source_name=source_name, match_found=False, details_count=0, raw_data=[])

        # Змінна для даних
        final_data = items

        # КРОК 2: Двоетапний запит
        if config.get("is_two_step"):
            detail_tasks = []
            template = config["detail_template"]
            id_field_name = config.get("id_field", "id")

            for item in items:
                item_id = item.get(id_field_name)
                if item_id:
                    detail_tasks.append(_fetch_details(client, template, str(item_id)))

            if detail_tasks:
                details_results = await asyncio.gather(*detail_tasks)
                final_data = [d for d in details_results if d is not None]

        # КРОК 3: Фільтрація за датою народження (Нова логіка)
        if candidate_birth_date and final_data:
            final_data = _filter_by_birth_year(final_data, candidate_birth_date)

        # Якщо після фільтрації нічого не лишилось
        if not final_data:
            return CheckResult(source_name=source_name, match_found=False, details_count=0, raw_data=[])

        return CheckResult(
            source_name=source_name,
            match_found=True,
            details_count=len(final_data),
            raw_data=final_data
        )

    except Exception as e:
        print(f"Error checking {source_name}: {e}")
        return CheckResult(source_name=source_name, match_found=False, details_count=0, raw_data=[])


async def _fetch_details(client: httpx.AsyncClient, url_template: str, item_id: str) -> dict:
    """Робить запит на отримання деталей по конкретному ID"""
    try:
        # Підставляємо ID в URL (наприклад: .../corruptedPersons/12345)
        url = f"{BASE_URL}{url_template.format(id=item_id)}"
        response = await client.get(url, headers=HEADERS)
        if response.status_code == 200:
            return response.json()
    except Exception:
        print("You Control Exception")
        pass
    return None


def _filter_by_birth_year(records: List[dict], candidate_date: str) -> List[dict]:
    """
    Залишає тільки ті записи, де рік народження збігається або дата відсутня.
    """
    try:
        # Витягуємо рік з дати кандидата
        candidate_year = str(parser.parse(candidate_date).year)
    except:
        # Якщо дата кандидата крива, не фільтруємо нічого
        return records

    filtered_records = []

    # Ключі, в яких API YouScore зазвичай віддає дату народження
    date_keys = ['dateOfBirth', 'birthDate', 'birth_date', 'DateOfBirth', 'yearOfBirth']

    for record in records:
        record_year = None

        # 1. Шукаємо дату в відомих полях
        for key in date_keys:
            if key in record and record[key]:
                try:
                    # Пробуємо розпарсити дату з запису
                    dt = parser.parse(str(record[key]))
                    record_year = str(dt.year)
                    break
                except:
                    continue

        # 2. Логіка рішення
        if record_year:
            # Якщо в запису Є дата, і вона НЕ збігається -> видаляємо (не додаємо в список)
            if record_year == candidate_year:
                filtered_records.append(record)
        else:
            # Якщо в запису НЕМАЄ дати (або ми не знайшли) -> залишаємо!
            # Хай краще LLM розбереться, ніж ми випадково видалимо правильного
            filtered_records.append(record)

    return filtered_records
