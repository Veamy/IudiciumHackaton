from fastapi import FastAPI

from api import ai_api, minio_api, candidate_api, position_api
from core.cors import set_cors
from core.lifespan import lifespan

app = FastAPI(title="iudicium backend", version="0.1.0", lifespan=lifespan)
set_cors(app)

app.include_router(ai_api.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(minio_api.router, prefix="/api/v1/minio", tags=["Minio"])
app.include_router(candidate_api.router, prefix="/api/v1/candidate", tags=["Candidate"])
app.include_router(position_api.router, prefix="/api/v1/position", tags=["Position"])


@app.get("/")
async def root():
    return {"message": "Iudicium is running!"}
