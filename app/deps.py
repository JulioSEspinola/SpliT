from typing import Generator

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, verify_supabase_token
from app.database import SessionLocal
from app.models.user import User


def get_db() -> Generator:
    """Yields a DB session and guarantees it's closed after the request,
    even if the handler raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    """Verifies the Supabase Auth JWT sent as 'Authorization: Bearer <token>'
    and loads the matching public.users row (mirrored from auth.users by the
    trigger in 0002_auth_users_mirror_trigger).
    """
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    try:
        payload = verify_supabase_token(token)
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="No user found for this token")
    return user
