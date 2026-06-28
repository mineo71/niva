"""weather cache table

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "weather_cache",
        sa.Column(
            "field_id",
            sa.Integer,
            sa.ForeignKey("fields.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("source", sa.String(32), nullable=False),
        sa.Column("current", postgresql.JSONB, nullable=False),
        sa.Column("forecast", postgresql.JSONB, nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("weather_cache")
