from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    research_model: str = "google/gemini-2.0-flash-exp"
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
