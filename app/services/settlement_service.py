import heapq
import uuid
from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.schemas.expense import SettlementOut
from app.services.balance_service import get_group_balances


def get_simplified_settlements(db: Session, group_id: uuid.UUID) -> List[SettlementOut]:
    """Turns a group's pairwise balances into the minimum number of payments
    needed to settle everyone up.

    Algorithm: greedy max-heap matching.
    1. Reduce all pairwise balances to a single net position per person
       (how much they're owed overall, could be negative if they owe money).
    2. Repeatedly match the person owed the most with the person who owes
       the most, settle the smaller of the two amounts between them, and
       push the remainder back into the heap.

    This isn't guaranteed to find the mathematically absolute minimum number
    of transactions in every case (that's an NP-hard partition problem in
    general), but greedy max-matching gets very close in practice and runs
    in O(n log n), which is the right tradeoff for a real product.
    """
    pairwise = get_group_balances(db, group_id)
    net_position = _to_net_positions(pairwise)
    return _greedy_settle(net_position)


def _to_net_positions(pairwise: dict) -> dict:
    """pairwise: {(a, b): amount} where amount > 0 means b owes a.
    Returns {user_id: net_amount} where positive = owed money overall,
    negative = owes money overall.
    """
    net = {}
    for (a, b), amount in pairwise.items():
        net[a] = net.get(a, Decimal("0")) + amount   # a is owed `amount`
        net[b] = net.get(b, Decimal("0")) - amount   # b owes `amount`
    return net


def _greedy_settle(net_position: dict) -> List[SettlementOut]:
    # Max-heap via negation: creditors (owed money, positive net)
    creditors = [(-amount, uid) for uid, amount in net_position.items() if amount > 0]
    debtors = [(amount, uid) for uid, amount in net_position.items() if amount < 0]  # amount is negative

    heapq.heapify(creditors)
    heapq.heapify(debtors)  # smallest (most negative) first = owes the most

    settlements = []

    while creditors and debtors:
        neg_credit, creditor_id = heapq.heappop(creditors)
        debt, debtor_id = heapq.heappop(debtors)

        credit_amount = -neg_credit
        debt_amount = -debt  # make positive for comparison

        settle_amount = min(credit_amount, debt_amount)
        settlements.append(SettlementOut(from_user=debtor_id, to_user=creditor_id, amount=settle_amount))

        remaining_credit = credit_amount - settle_amount
        remaining_debt = debt_amount - settle_amount

        if remaining_credit > 0:
            heapq.heappush(creditors, (-remaining_credit, creditor_id))
        if remaining_debt > 0:
            heapq.heappush(debtors, (-remaining_debt, debtor_id))

    return settlements
