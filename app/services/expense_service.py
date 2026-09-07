import uuid
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session, joinedload

from app.core.idempotency import find_existing_expense_by_key
from app.models.expense import Expense, ExpenseSplit, SplitType
from app.models.group import GroupMember
from app.schemas.expense import ExpenseCreate


class ExpenseValidationError(Exception):
    pass


def list_group_expenses(db: Session, group_id: uuid.UUID, limit: int = 50, offset: int = 0) -> list[Expense]:
    return (
        db.query(Expense)
        .options(joinedload(Expense.splits))
        .filter(Expense.group_id == group_id, Expense.deleted_at.is_(None))
        .order_by(Expense.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_expense(db: Session, payload: ExpenseCreate, idempotency_key: str | None = None) -> Expense:
    """Creates an expense and its splits atomically.

    - If idempotency_key matches an existing expense, returns that expense
      instead of creating a duplicate (safe for client retries).
    - EVEN splits are computed here from current group membership.
    - CUSTOM/PERCENTAGE splits are validated to make sure they actually
      add up to the full expense amount before anything is written.
    """
    existing = find_existing_expense_by_key(db, idempotency_key)
    if existing:
        return existing

    member_ids = [
        m.user_id for m in db.query(GroupMember).filter(GroupMember.group_id == payload.group_id).all()
    ]
    if payload.paid_by not in member_ids:
        raise ExpenseValidationError("Payer is not a member of this group")

    splits = _compute_splits(payload, member_ids)

    expense = Expense(
        group_id=payload.group_id,
        paid_by=payload.paid_by,
        amount=payload.amount,
        description=payload.description,
        split_type=payload.split_type,
        idempotency_key=idempotency_key,
    )

    try:
        db.add(expense)
        db.flush()  # get expense.id without committing yet

        for user_id, amount_owed in splits.items():
            db.add(ExpenseSplit(expense_id=expense.id, user_id=user_id, amount_owed=amount_owed))

        db.commit()
        db.refresh(expense)
        return expense
    except Exception:
        db.rollback()
        raise


def _compute_splits(payload: ExpenseCreate, member_ids: list) -> dict:
    if payload.split_type == SplitType.EVEN:
        return _split_evenly(payload.amount, member_ids)

    if payload.split_type == SplitType.CUSTOM:
        return _split_custom(payload.amount, payload.splits)

    if payload.split_type == SplitType.PERCENTAGE:
        return _split_percentage(payload.amount, payload.splits)

    raise ExpenseValidationError(f"Unsupported split type: {payload.split_type}")


def _split_evenly(amount: Decimal, member_ids: list) -> dict:
    if not member_ids:
        raise ExpenseValidationError("Group has no members to split with")

    n = len(member_ids)
    base_share = (amount / n).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    splits = {uid: base_share for uid in member_ids}

    # Cents left over from rounding go to the first member (deterministic,
    # simple, and the discrepancy is at most a few cents).
    remainder = amount - (base_share * n)
    if remainder != 0:
        first = member_ids[0]
        splits[first] = splits[first] + remainder

    return splits


def _split_custom(amount: Decimal, splits_in: list) -> dict:
    total = sum(s.value for s in splits_in)
    if total != amount:
        raise ExpenseValidationError(f"Custom split amounts ({total}) must sum to expense amount ({amount})")
    return {s.user_id: s.value for s in splits_in}


def _split_percentage(amount: Decimal, splits_in: list) -> dict:
    total_pct = sum(s.value for s in splits_in)
    if total_pct != Decimal("100"):
        raise ExpenseValidationError(f"Split percentages must sum to 100 (got {total_pct})")

    splits = {}
    running_total = Decimal("0")
    for i, s in enumerate(splits_in):
        if i == len(splits_in) - 1:
            # last person absorbs rounding remainder, same trick as even split
            splits[s.user_id] = (amount - running_total).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            share = (amount * s.value / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            splits[s.user_id] = share
            running_total += share

    return splits
