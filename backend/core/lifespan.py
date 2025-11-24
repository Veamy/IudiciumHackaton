from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.config import settings
from db.session import engine, Base
from object_storage.minio_client import minio_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not minio_client.bucket_exists(settings.MINIO_BUCKET):
        minio_client.make_bucket(settings.MINIO_BUCKET)
        print("Bucket created")
    else:
        print("Bucket already exists")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Database connected, tables created")

    yield

    await engine.dispose()
    print("Database disconnected")
