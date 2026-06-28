"""init: postgis, users, fields

Revision ID: 0001
Revises:
Create Date: 2026-06-28
"""
from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("language", sa.String(5), nullable=False, server_default="uk"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "fields",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "owner_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("crop_type", sa.String(64), nullable=False),
        sa.Column("soil_type", sa.String(64), nullable=False),
        sa.Column("area_ha", sa.Float, nullable=False, server_default="0"),
        sa.Column(
            "geometry",
            geoalchemy2.Geometry("POLYGON", srid=4326, spatial_index=False),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_fields_owner_id", "fields", ["owner_id"])
    op.execute("CREATE INDEX ix_fields_geometry ON fields USING gist (geometry)")


def downgrade() -> None:
    op.drop_table("fields")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
