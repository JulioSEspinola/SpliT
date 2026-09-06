import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.schemas.expense import ExpenseCreate, ExpenseOut, BalanceOut, SettlementOut
from app.services.expense_service import create_expense, ExpenseValidationError
from app.services.balance_service import get_group_balances
from app.services.settlement_service import get_simplified_settlements

router = APIRouter(tags=["expenses"])


@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def add_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    try:
        return create_expense(db, payload, idempotency_key)
    except ExpenseValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/groups/{group_id}/balances", response_model=List[BalanceOut])
def group_balances(group_id: uuid.UUID, db: Session = Depends(get_db)):
    pairwise = get_group_balances(db, group_id)
    return [
        BalanceOut(user_a=a, user_b=b, amount=amount)
        for (a, b), amount in pairwise.items()
    ]


@router.get("/groups/{group_id}/settlements", response_model=List[SettlementOut])
def group_settlements(group_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_simplified_settlements(db, group_id)
