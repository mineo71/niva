from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.core.config import settings
from app.fields.router import router as fields_router
from app.insights import router as insights_router
from app.stats.router import router as stats_router

app = FastAPI(title=f"{settings.app_name} API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(fields_router)
app.include_router(insights_router)
app.include_router(stats_router)


@app.get("/", tags=["health"])
def health():
    return {"status": "healthy", "app": settings.app_name}
