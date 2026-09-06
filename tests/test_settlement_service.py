"""
Unit tests for the debt simplification algorithm.

These test `_greedy_settle` and `_to_net_positions` directly with fabricated
balance dicts, so no database is needed -- exactly why the algorithm was
kept as a standalone, injectable function.
"""
import uuid
from decimal import Decimal

from app.services.settlement_service import _greedy_settle, _to_net_positions

alice, bob, carol = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()


def test_two_person_simple_debt():
    # bob owes alice $20
    pairwise = {(alice, bob): Decimal("20")}
    net = _to_net_positions(pairwise)
    settlements = _greedy_settle(net)

    assert len(settlements) == 1
    assert settlements[0].from_user == bob
    assert settlements[0].to_user == alice
    assert settlements[0].amount == Decimal("20")


def test_circular_debt_cancels_out():
    # alice owes bob $10, bob owes carol $10, carol owes alice $10
    # net position of everyone is 0 -- nobody should owe anybody
    pairwise = {
        (bob, alice): Decimal("10"),   # alice owes bob
        (carol, bob): Decimal("10"),   # bob owes carol
        (alice, carol): Decimal("10"), # carol owes alice
    }
    net = _to_net_positions(pairwise)
    settlements = _greedy_settle(net)

    assert settlements == []


def test_three_person_reduces_transaction_count():
    # alice paid for everything: bob owes alice $30, carol owes alice $30
    # Already minimal (2 txns) -- but this is the case debt simplification
    # matters for: without it, if this came from separate pairwise expenses
    # bob might also owe carol something that a naive per-expense view
    # wouldn't cancel out.
    pairwise = {
        (alice, bob): Decimal("30"),
        (alice, carol): Decimal("30"),
        (bob, carol): Decimal("5"),  # carol owes bob $5 separately
    }
    net = _to_net_positions(pairwise)
    settlements = _greedy_settle(net)

    # net positions: alice +60, bob -30+5=-25, carol -30-5=-35
    total_owed = sum(s.amount for s in settlements)
    assert total_owed == Decimal("60")
    assert len(settlements) <= 2  # should NOT take 3 separate payments


def test_no_balances_no_settlements():
    assert _greedy_settle({}) == []
