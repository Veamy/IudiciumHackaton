// src/views/NewPositionCreateView.tsx

import { useState, useCallback } from 'react';
import PositionParameterFormView from '../../../components/PositionParameterFormView/PositionParameterFormView';
import { type PositionParameter } from '../../../types/PositionParameter';
import { type Position } from '../../../types/Position';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // <--- Додано для навігації
import { ROUTES } from '../../../ROUTES'; // <--- Припускаємо, що маршрути доступні

interface NewPositionCreateViewProps {
  onCancel?: () => void;
}

// Тип відповіді від бекенда (припускаємо, що повертає ID)
interface PositionCreateResponse {
    id: string; // Новий ID позиції
    // Можуть бути інші поля, якщо потрібно
}

const NewPositionCreateView: React.FC<NewPositionCreateViewProps> = ({ onCancel }) => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // <--- Ініціалізація навігації

  const [name, setName] = useState('');
  const [parameters, setParameters] = useState<PositionParameter[]>([]);
  const [nameError, setNameError] = useState('');
  const [parametersError, setParametersError] = useState('');
  const [parameterErrors, setParameterErrors] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false); // <--- Стан завантаження
  const [apiError, setApiError] = useState(''); // <--- Стан помилки API

  const handleAddParameter = useCallback(() => {
    setParameters((prev) => [...prev, { title: '', description: '', point: 0 }]);
    setParameterErrors((prev) => [...prev, '']);
  }, []);

  const handleRemoveParameter = useCallback((index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
    setParameterErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleParameterChange = useCallback(
    (index: number, updated: PositionParameter) => {
      setParameters((prev) => prev.map((p, i) => (i === index ? updated : p)));

      let error = '';
      if (!updated.title.trim()) {
        error = t('NewPositionCreateView.errors.titleRequired');
      } else if (updated.point < 0) {
        error = t('NewPositionCreateView.errors.pointsNonNegative');
      }
      setParameterErrors((prev) => {
        const next = [...prev];
        next[index] = error;
        return next;
      });
    },
    [t]
  );

  const validate = useCallback((): boolean => {
    let isValid = true;
    setApiError(''); // Скидаємо помилку API при новій валідації

    if (!name.trim()) {
      setNameError(t('NewPositionCreateView.errors.nameRequired'));
      isValid = false;
    } else if (name.length > 100) {
      setNameError(t('NewPositionCreateView.errors.nameMaxLength'));
      isValid = false;
    } else {
      setNameError('');
    }

    if (parameters.length === 0) {
      setParametersError(t('NewPositionCreateView.errors.atLeastOneParameter'));
      isValid = false;
    } else {
      setParametersError('');
    }

    const newParamErrors = parameters.map((p) => {
      if (!p.title.trim()) return t('NewPositionCreateView.errors.titleRequired');
      if (p.point < 0) return t('NewPositionCreateView.errors.pointsNonNegative');
      return '';
    });
    setParameterErrors(newParamErrors);

    if (newParamErrors.some((e) => e !== '')) isValid = false;

    return isValid;
  }, [name, parameters, t]);

  const sendPositionToServer = useCallback(async (positionData: Position) => {
    setIsSubmitting(true);
    setApiError('');

    try {
        const response = await fetch('/api/v1/position/create', { // <--- Кінцева точка API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(positionData),
        });

        if (!response.ok) {
            // Припускаємо, що бекенд повертає JSON з помилкою
            const errorData = await response.json().catch(() => ({ message: 'Сервер повернув незрозумілу помилку.' }));
            throw new Error(errorData.message || `HTTP ${response.status}: Невідома помилка сервера.`);
        }

        const data: PositionCreateResponse = await response.json();

        if (data.id) {
            // Успіх: перенаправляємо на сторінку перегляду
            const newPath = `${ROUTES.INFO}/position/${data.id}`;
            navigate(newPath);
            return; // Виходимо, щоб не скидати форму
        }

        throw new Error('Успішна відповідь, але ID нової позиції відсутній.');

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'Невідома помилка мережі.';
        setApiError(errorMessage);
        console.error('Помилка при створенні позиції:', error);
    } finally {
        setIsSubmitting(false);
    }
  }, [navigate]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const positionData: Position = {
      name: name.trim(),
      parameters: parameters.map((p) => ({
        title: p.title.trim(),
        description: p.description?.trim() ?? '',
        point: p.point,
      })),
    };

    sendPositionToServer(positionData);
    
    // Примітка: Скидання форми (setName, setParameters) відбувається лише 
    // після навігації (тобто не потрібно, якщо навігація успішна) або
    // після скасування. Ми не скидаємо форму тут, щоб користувач міг 
    // спробувати повторно після помилки API.
  }, [name, parameters, validate, sendPositionToServer]);


  const tp = (key: string) => t(`NewPositionCreateView.${key}`);

  // Стиль спінера для відображення завантаження
  const spinnerStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '1.2em',
      height: '1.2em',
      verticalAlign: 'middle',
      borderRadius: '50%',
      border: '2px solid white',
      borderRightColor: 'transparent',
      animation: 'spin 1s linear infinite'
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>{tp('title')}</h2>
      
      {/* Повідомлення про помилку API */}
      {apiError && (
          <div style={{ color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              **Помилка API:** {apiError}
          </div>
      )}

      {/* === Назва позиції === */}
      <section style={{ marginBottom: 32 }}>
        <h3>{tp('basicInfo')}</h3>
        <label>
          {tp('positionName')} <br />
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            maxLength={100}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
            disabled={isSubmitting}
          />
          {nameError && <div style={{ color: 'red' }}>{nameError}</div>}
          <small>
            {name.length}/100 {t('NewPositionCreateView.characters', { count: name.length })}
          </small>
        </label>
      </section>

      {/* === Параметри === */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{tp('parameters')}</h3>
          <button type="button" onClick={handleAddParameter} disabled={isSubmitting}>
            {tp('addParameter')}
          </button>
        </div>

        {parametersError && <div style={{ color: 'red' }}>{parametersError}</div>}

        {parameters.length === 0 ? (
          <p>{tp('noParameters')}</p>
        ) : (
          parameters.map((param, index) => (
            <div key={index} style={{ marginBottom: 24 }}>
              <PositionParameterFormView
                parameter={param}
                onChange={(updated) => handleParameterChange(index, updated)}
                onRemove={() => handleRemoveParameter(index)}
                index={index + 1}
              />
              {parameterErrors[index] && (
                <div style={{ color: 'red', marginTop: 4 }}>{parameterErrors[index]}</div>
              )}
            </div>
          ))
        )}
      </section>

      {/* === Кнопки === */}
      <div style={{ marginTop: 40 }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting} // Вимикаємо кнопку під час завантаження
          style={{ 
            marginRight: 16, 
            padding: '12px 24px', 
            fontSize: 16,
            // Додаємо стилі для кнопки під час завантаження
            opacity: isSubmitting ? 0.7 : 1, 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? (
              <>
                <span style={{ marginRight: '8px' }}>Створення...</span>
                <span style={spinnerStyle} />
              </>
          ) : (
            tp('createPosition')
          )}
        </button>
        {onCancel && (
          <button onClick={onCancel} style={{ padding: '12px 24px' }} disabled={isSubmitting}>
            {tp('cancel')}
          </button>
        )}
      </div>

      {/* Видалили successMessage, оскільки успішне збереження призводить до навігації */}

      {/* === Дебаг === */}
      <details style={{ marginTop: 40 }}>
        <summary>{tp('debugJson')}</summary>
        <pre>{JSON.stringify({ name, parameters }, null, 2)}</pre>
      </details>
    </div>
  );
};

export default NewPositionCreateView;