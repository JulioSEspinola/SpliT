import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseOut, BalanceOut, SettlementOut
from app.services import group_service
from app.services.expense_service import create_expense, list_group_expenses, ExpenseValidationError
from app.services.balance_service import get_group_balances
from app.services.settlement_service import get_simplified_settlements

router = APIRouter(tags=["expenses"])


def _require_membership(db: Session, group_id: uuid.UUID, user_id: uuid.UUID) -> None:
    if not group_service.is_group_member(db, group_id, user_id):
        raise HTTPException(status_code=404, detail="Group not found")


@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def add_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    _require_membership(db, payload.group_id, current_user.id)
    try:
        return create_expense(db, payload, idempotency_key)
    except ExpenseValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/groups/{group_id}/expenses", response_model=List[ExpenseOut])
def group_expenses(
    group_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, group_id, current_user.id)
    return list_group_expenses(db, group_id, limit=min(limit, 100), offset=offset)


@router.get("/groups/{group_id}/balances", response_model=List[BalanceOut])
def group_balances(
    group_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, group_id, current_user.id)
    pairwise = get_group_balances(db, group_id)
    return [
        BalanceOut(user_a=a, user_b=b, amount=amount)
        for (a, b), amount in pairwise.items()
    ]


@router.get("/groups/{group_id}/settlements", response_model=List[SettlementOut])
def group_settlements(
    group_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, group_id, current_user.id)
    return get_simplified_settlements(db, group_id)
