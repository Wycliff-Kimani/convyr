from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List
import os


class Settings(BaseSettings):
    # ========================
    # App
    # ========================
    APP_NAME: str = "Convyr"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    DEBUG: bool = True
    PORT: int = 8000

    # ========================
    # WhatsApp / Meta Cloud API
    # ========================
    WHATSAPP_ACCESS_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str
    WHATSAPP_BUSINESS_ACCOUNT_ID: str
    WHATSAPP_VERIFY_TOKEN: str

    # ========================
    # Supabase
    # ========================
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""

    # ========================
    # Redis (Upstash)
    # ========================
    REDIS_URL: str = ""
    REDIS_TOKEN: str = ""

    # ========================
    # PayHero
    # ========================
    PAYHERO_USERNAME: str = ""
    PAYHERO_PASSWORD: str = ""
    PAYHERO_CHANNEL_ID: str = ""
    PAYHERO_API_URL: str = "https://backend.payhero.co.ke/api/v2"
    PAYHERO_CALLBACK_URL: str = ""

    # ========================
    # CORS
    # ========================
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a Python list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @property
    def payhero_basic_auth(self) -> str:
        """
        Returns the base64-encoded Basic Auth header value
        required by all PayHero API requests.
        Format: base64(username:password)
        """
        import base64
        credentials = f"{self.PAYHERO_USERNAME}:{self.PAYHERO_PASSWORD}"
        return base64.b64encode(credentials.encode()).decode()

    model_config = {
        "env_file": os.path.join(os.path.dirname(__file__), "../../.env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Single shared instance — import this everywhere
settings = Settings()
