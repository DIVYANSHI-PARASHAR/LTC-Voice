"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # VAPI Configuration (with defaults for development)
    vapi_private_api_key: str = "df253068-44f2-4683-affd-fd6dbb44f24d"
    vapi_phone_number_id: str = "25ba689c-1f14-4991-a093-76196783dd9d"
    vapi_assistant_id: str = "5113fdc8-a44e-4b03-84c6-56d040a2f16d"

    # Server Configuration
    backend_port: int = 8000
    frontend_url: str = "http://localhost:8080"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
