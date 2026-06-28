from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # app
    app_name: str = "Niva"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # db
    database_url: str = "postgresql+psycopg://niva:niva@localhost:5432/niva"

    # auth
    jwt_secret: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_access_min: int = 15
    jwt_refresh_days: int = 3

    # external apis
    sentinel_client_id: str = ""
    sentinel_client_secret: str = ""
    owm_api_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # caching
    ndvi_cache_days: int = 7
    weather_cache_hours: int = 24


settings = Settings()
