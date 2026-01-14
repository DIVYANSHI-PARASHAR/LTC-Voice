"""
Application Configuration
Supports both local development and Vercel serverless deployment
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # VAPI Configuration
    # In Vercel, these come from environment variables
    # In local dev, can use defaults or .env file
    vapi_private_api_key: str = os.getenv(
        "VAPI_PRIVATE_API_KEY", 
        "df253068-44f2-4683-affd-fd6dbb44f24d"  # Dev default
    )
    vapi_phone_number_id: str = os.getenv(
        "VAPI_PHONE_NUMBER_ID",
        "25ba689c-1f14-4991-a093-76196783dd9d"  # Dev default
    )
    vapi_assistant_id: str = os.getenv(
        "VAPI_ASSISTANT_ID",
        "5113fdc8-a44e-4b03-84c6-56d040a2f16d"  # Dev default
    )

    # Server Configuration
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
    
    # Frontend URL - use Vercel URL if available, otherwise localhost
    frontend_url: str = os.getenv(
        "FRONTEND_URL",
        os.getenv("VERCEL_URL", "http://localhost:8080")
    )
    
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
