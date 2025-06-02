from datetime import datetime, timedelta
from jose import jwt
from config.settings import settings

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_access_token(token: str):
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
