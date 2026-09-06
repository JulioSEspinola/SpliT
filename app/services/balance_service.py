import uuid
from collections import defaultdict
from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense


def get_group_balances(db: Session, group_id: uuid.UUID) -> dict:
    """Computes net pairwise balances for a group from full expense history.

    Returns {(user_a, user_b): amount} where a positive amount means
    user_b owes user_a. Computed fresh on every call for MVP simplicity —
    see note in README about moving to materialized balances later.
    """
    expenses = (
        db.query(Expense)
        .options(joinedload(Expense.splits))
        .filter(Expense.group_id == group_id, Expense.deleted_at.is_(None))
        .all()
    )

    # net[a][b] = amount b owes a
    net = defaultdict(lambda: defaultdict(Decimal))

    for expense in expenses:
        payer = expense.paid_by
        for split in expense.splits:
            if split.user_id == payer:
                continue  # payer doesn't owe themselves
            net[payer][split.user_id] += split.amount_owed

    return _simplify_pairs(net)


def _simplify_pairs(net: dict) -> dict:
    """Collapses net[a][b] and net[b][a] into a single signed balance per pair
    so 'A owes B $10, B owes A $4' becomes 'A owes B $6'.
    """
    result = {}
    seen = set()

    all_users = set(net.keys()) | {u for inner in net.values() for u in inner}

    for a in all_users:
        for b in all_users:
            if a >= b or (a, b) in seen or (b, a) in seen:
                continue
            seen.add((a, b))

            a_owes_b = net[a][b]
            b_owes_a = net[b][a]
            diff = b_owes_a - a_owes_b  # positive: b owes a

            if diff != 0:
                result[(a, b)] = diff

    return result
