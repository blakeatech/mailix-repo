# config/settings.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "https://api.notaic.site/auth/callback"
    aws_region: str
    aws_access_key_id: str
    aws_secret_access_key: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    openai_api_key: str
    access_token_expire_minutes: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
