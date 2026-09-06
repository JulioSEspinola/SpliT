# Splitwise Clone — MVP

A group expense-splitting API built with FastAPI + Postgres, structured with
payments-engineering concerns in mind: idempotent writes, transactional
ledger updates, and a debt-simplification algorithm.

## Setup

```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env           # then edit DATABASE_URL / SECRET_KEY
```

You'll need a local Postgres instance. Quick option with Docker:

```bash
docker run --name splitwise-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=splitwise -p 5432:5432 -d postgres:16
```

Run migrations:

```bash
alembic upgrade head
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API docs (FastAPI gives
you this for free — good to show off in a demo).

## Run tests

```bash
pytest
```

Start with `tests/test_settlement_service.py` — it tests the debt
simplification algorithm in isolation with no DB required.

## Architecture notes

- **Routes stay thin.** `app/api/*.py` only validates input and calls into
  `app/services/*.py`. All business logic lives in services so it's testable
  without spinning up the API layer.
- **Balances are computed on read**, not materialized, for MVP simplicity.
  Every call to `/groups/{id}/balances` walks the full expense history. This
  is a deliberate simplicity-over-performance tradeoff worth being able to
  explain: at scale you'd move to a materialized `Balance` table updated
  on each expense write (or via an event/queue), with periodic reconciliation
  to catch drift.
- **Idempotency** is handled via a unique `idempotency_key` column on
  `Expense`, checked before insert (`app/core/idempotency.py`). Clients pass
  an `Idempotency-Key` header on `POST /expenses`; a retried request with the
  same key returns the original expense instead of creating a duplicate.
- **Expense creation is one DB transaction** — the expense row and all its
  splits are written together in `expense_service.create_expense`, so a
  failure partway through never leaves a dangling expense with no splits.
- **Debt simplification** (`settlement_service.py`) is a greedy max-heap
  matching algorithm: repeatedly pair whoever is owed the most with whoever
  owes the most. It runs in O(n log n) and gets very close to the true
  minimum transaction count without needing an NP-hard exact solver.

## What's NOT built yet (by design, for MVP)

- Auth is stubbed — routes take `user_id`/`created_by` as explicit
  params instead of pulling from a JWT. Wire up `app/core/security.py` +
  a `get_current_user` dependency in `app/deps.py` next.
- No real payment integration yet (Phase 2 — Stripe/PayPal settlement).
- No WebSocket/real-time collaborative splitting yet (Phase 3).
- Soft-delete (`deleted_at` on `Expense`) is modeled but no delete endpoint
  exists yet — balances already filter it out so it's ready to wire up.

## Suggested next steps

1. Get this running locally end-to-end (create a user, group, expense,
   check balances and settlements via `/docs`)
2. Add a `DELETE /expenses/{id}` endpoint (soft delete) and a test proving
   balances recompute correctly afterward
3. Wire up real auth
4. Then move to Phase 2 (real Stripe/PayPal settlement)
