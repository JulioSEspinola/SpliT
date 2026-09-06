import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, model_validator

from app.models.expense import SplitType


class ExpenseSplitIn(BaseModel):
    """Only needed when split_type is CUSTOM or PERCENTAGE.
    For EVEN splits, the service computes this automatically from group members.
    """
    user_id: uuid.UUID
    value: Decimal  # dollar amount for CUSTOM, percentage points for PERCENTAGE


class ExpenseCreate(BaseModel):
    group_id: uuid.UUID
    paid_by: uuid.UUID
    amount: Decimal
    description: Optional[str] = None
    split_type: SplitType = SplitType.EVEN
    splits: Optional[List[ExpenseSplitIn]] = None  # required for CUSTOM/PERCENTAGE

    @model_validator(mode="after")
    def validate_splits_present_when_required(self):
        if self.split_type != SplitType.EVEN and not self.splits:
            raise ValueError(f"splits is required when split_type is '{self.split_type}'")
        return self


class ExpenseSplitOut(BaseModel):
    user_id: uuid.UUID
    amount_owed: Decimal

    class Config:
        from_attributes = True


class ExpenseOut(BaseModel):
    id: uuid.UUID
    group_id: uuid.UUID
    paid_by: uuid.UUID
    amount: Decimal
    description: Optional[str]
    split_type: SplitType
    created_at: datetime
    splits: List[ExpenseSplitOut]

    class Config:
        from_attributes = True


class BalanceOut(BaseModel):
    """Net balance between two users within a group.
    Positive amount means user_b owes user_a.
    """
    user_a: uuid.UUID
    user_b: uuid.UUID
    amount: Decimal


class SettlementOut(BaseModel):
    """A single suggested payment to simplify group debts."""
    from_user: uuid.UUID
    to_user: uuid.UUID
    amount: Decimal
