"""
Idempotency handling for mutating endpoints.

MVP approach: rely on a unique `idempotency_key` column on the table being
written to (see Expense model). Before inserting, check whether a row with
that key already exists and return it instead of creating a duplicate.

This is enough for the MVP. If this needs to scale across multiple resource
types later, swap this for a generic `idempotency_keys` table (key -> stored
response) checked in a shared FastAPI dependency, so every mutating route
gets the behavior for free instead of reimplementing it per-service.
"""

from sqlalchemy.orm import Session

from app.models.expense import Expense


def find_existing_expense_by_key(db: Session, idempotency_key: str | None) -> Expense | None:
    if not idempotency_key:
        return None
    return db.query(Expense).filter(Expense.idempotency_key == idempotency_key).first()
