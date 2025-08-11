from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    JWT_SECRET: str = "dev-secret"  # overridden by .env
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 7*24*60
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

settings = Settings()
