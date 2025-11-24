from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

engine = create_async_engine(settings.database_uri(), echo=True)

asyncSession = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with asyncSession() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

Base = declarative_base()
