import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SplitType(str, enum.Enum):
    EVEN = "even"
    PERCENTAGE = "percentage"
    CUSTOM = "custom"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    paid_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String, nullable=True)
    split_type = Column(Enum(SplitType), nullable=False, default=SplitType.EVEN)

    # Prevents duplicate expense creation on client retries.
    # Unique so a repeated request with the same key is rejected/short-circuited
    # rather than creating a second expense.
    idempotency_key = Column(String, unique=True, nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # soft delete, keeps ledger history intact

    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_id = Column(UUID(as_uuid=True), ForeignKey("expenses.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount_owed = Column(Numeric(12, 2), nullable=False)

    expense = relationship("Expense", back_populates="splits")
