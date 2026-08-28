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

    def effective_database_url(self) -> str:
        """Normalize common hosted Postgres URL schemes for psycopg v3."""
        url = self.database_url.strip()
        if url.startswith("postgres://"):
            return "postgresql+psycopg://" + url[len("postgres://") :]
        if url.startswith("postgresql://"):
            return "postgresql+psycopg://" + url[len("postgresql://") :]
        if url.startswith("postgresql+psycopg2://"):
            return "postgresql+psycopg://" + url[len("postgresql+psycopg2://") :]
        return url

    def effective_auth_secret(self) -> str:
        return self.auth_secret or "hiresense-development-secret-change-me"


settings = Settings()
settings.database_url = settings.effective_database_url()
settings.auth_secret = settings.effective_auth_secret()
