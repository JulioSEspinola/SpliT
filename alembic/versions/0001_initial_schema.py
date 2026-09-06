"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("hashed_password", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "group_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("groups.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("joined_at", sa.DateTime, nullable=False),
        sa.UniqueConstraint("group_id", "user_id", name="uq_group_user"),
    )

    split_type_enum = postgresql.ENUM("even", "percentage", "custom", name="splittype")

    op.create_table(
        "expenses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("groups.id"), nullable=False),
        sa.Column("paid_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("description", sa.String, nullable=True),
        sa.Column("split_type", split_type_enum, nullable=False, server_default="even"),
        sa.Column("idempotency_key", sa.String, nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("deleted_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_expenses_idempotency_key", "expenses", ["idempotency_key"])

    op.create_table(
        "expense_splits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("expense_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("expenses.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount_owed", sa.Numeric(12, 2), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("expense_splits")
    op.drop_table("expenses")
    op.execute("DROP TYPE IF EXISTS splittype")
    op.drop_table("group_members")
    op.drop_table("groups")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
