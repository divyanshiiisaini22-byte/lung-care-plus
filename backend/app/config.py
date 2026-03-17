from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "lungcare-dev-secret-key-change-in-production-make-it-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = "sqlite:///./lungcare.db"
    FRONTEND_URL: str = "http://localhost:5173"

    # Email settings (for appointment notifications)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    class Config:
        env_file = ".env"


settings = Settings()