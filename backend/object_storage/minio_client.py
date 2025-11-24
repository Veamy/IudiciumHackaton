from core.config import settings
from minio import Minio

minio_client = Minio(endpoint=settings.MINIO_API + ":" + settings.MINIO_PORT,
                     access_key=settings.MINIO_ROOT_USER,
                     secret_key=settings.MINIO_ROOT_PASSWORD,
                     secure=settings.MINIO_SECURE)
