"""Quick connectivity check: python -m scripts.check_db"""
from sqlalchemy import text

from app.config import settings
from app.database import engine


def main() -> None:
    safe_url = settings.database_url
    if "@" in safe_url:
        head, tail = safe_url.split("@", 1)
        safe_url = head.rsplit(":", 1)[0] + ":***@" + tail
    print(f"Connecting to {safe_url}")

    with engine.connect() as conn:
        version = conn.execute(text("select version()")).scalar_one()
        tables = conn.execute(
            text(
                "select table_name from information_schema.tables "
                "where table_schema = 'public' order by table_name"
            )
        ).scalars().all()

    print(f"OK: {version}")
    print(f"public tables: {', '.join(tables) if tables else '(none — run alembic upgrade head)'}")


if __name__ == "__main__":
    main()
