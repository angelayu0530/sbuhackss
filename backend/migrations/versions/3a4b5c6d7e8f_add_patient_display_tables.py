"""Add patient display tables for mobile app

Revision ID: 3a4b5c6d7e8f
Revises: 2f3139333124
Create Date: 2025-11-08 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a4b5c6d7e8f'
down_revision = '2f3139333124'
branch_labels = None
depends_on = None


def upgrade():
    # Create patient_display_config table
    op.create_table('patient_display_config',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('show_schedule', sa.Boolean(), nullable=True, default=True),
        sa.Column('show_navigation', sa.Boolean(), nullable=True, default=True),
        sa.Column('show_faq', sa.Boolean(), nullable=True, default=True),
        sa.Column('home_address', sa.String(length=300), nullable=True),
        sa.Column('gps_tracking_enabled', sa.Boolean(), nullable=True, default=False),
        sa.Column('geofence_radius_meters', sa.Integer(), nullable=True, default=500),
        sa.Column('voice_reminders_enabled', sa.Boolean(), nullable=True, default=True),
        sa.Column('reminder_minutes_before', sa.Integer(), nullable=True, default=5),
        sa.Column('auto_mark_complete', sa.Boolean(), nullable=True, default=True),
        sa.Column('caregiver_status', sa.String(length=100), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.pid'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('patient_id')
    )

    # Create navigation_landmarks table
    op.create_table('navigation_landmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('photo_url', sa.String(length=500), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.pid'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create patient_faqs table
    op.create_table('patient_faqs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('question', sa.String(length=300), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
        sa.Column('voice_recording_url', sa.String(length=500), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=True, default=0),
        sa.Column('active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.pid'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create emergency_contacts table
    op.create_table('emergency_contacts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('relationship', sa.String(length=50), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('photo_url', sa.String(length=500), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=True, default=False),
        sa.Column('order_index', sa.Integer(), nullable=True, default=0),
        sa.Column('active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.pid'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('emergency_contacts')
    op.drop_table('patient_faqs')
    op.drop_table('navigation_landmarks')
    op.drop_table('patient_display_config')
