import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://hiresense:hiresense@localhost:5432/hiresense"
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.6-luna"
    auth_secret: str = ""
    auth_token_hours: int = 8
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def effective_auth_secret(self) -> str:
        return self.auth_secret or "hiresense-development-secret-change-me"

settings = Settings()
# Keep the development fallback simple; deployments must provide AUTH_SECRET.
settings.auth_secret = settings.effective_auth_secret()
