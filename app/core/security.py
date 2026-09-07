from jose import JWTError, jwt

from app.config import settings


class InvalidTokenError(Exception):
    pass


def verify_supabase_token(token: str) -> dict:
    """Verifies a Supabase Auth JWT and returns its decoded payload.
    """
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:
        raise InvalidTokenError(str(e)) from e
