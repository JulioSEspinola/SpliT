from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/splitwise"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
