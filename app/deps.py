from typing import Generator

from app.database import SessionLocal


def get_db() -> Generator:
    """Yields a DB session and guarantees it's closed after the request,
    even if the handler raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# NOTE: get_current_user (JWT-based auth dependency) goes here once
# app/core/security.py is filled in. For now, routes take a user_id
# explicitly so you can build and test the core flows first.
