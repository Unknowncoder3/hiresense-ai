from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://hiresense:hiresense@localhost:5432/hiresense"
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.6-luna"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
