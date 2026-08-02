import jwt
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from app.config import settings

def hash_password(password: str) -> str:
    """Hashes plain text password securely using SHA-256 + secret salt."""
    salted = f"{settings.jwt_secret}:{password}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password matches stored password hash."""
    return hash_password(plain_password) == hashed_password

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates signed JWT Access Token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    payload = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decodes and validates signed JWT Token."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except jwt.PyJWTError:
        return None
