import bcrypt # type: ignore # pyre-ignore
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError # type: ignore # pyre-ignore
import os
from dotenv import load_dotenv # type: ignore # pyre-ignore

load_dotenv()

# Secret key for JWT. In production, this should be a secure random string stored in environment variables.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "af9893d56a2fbeade990cdde0e45cf56e91f1a5b822d10bcb2e620573e048ebc")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    # Ensure password isn't greater than 72 bytes to avoid errors
    password_bytes = password[0:72].encode('utf-8') # type: ignore # pyre-ignore
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
