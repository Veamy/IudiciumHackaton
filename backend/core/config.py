from typing import List

from pydantic.v1 import BaseSettings


class Settings(BaseSettings):
    OLLAMA_API: str
    AI_MODEL: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_EXTERNAL_PORT: str
    POSTGRES_DB: str
    MINIO_API: str
    MINIO_PORT: str
    MINIO_EXTERNAL_PORT: str
    MINIO_PORT_APP: str
    MINIO_EXTERNAL_PORT_APP: str
    MINIO_ROOT_USER: str
    MINIO_ROOT_PASSWORD: str
    MINIO_BUCKET: str
    MINIO_SECURE: bool
    CORS_ORIGINS: List[str]
    YOUCONTROL_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def database_uri(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

settings = Settings()
