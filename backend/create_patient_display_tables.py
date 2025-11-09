"""
Manual script to create patient display tables
Run this if migrations are having issues
"""
from main import app
from db import db

with app.app_context():
    # Create all new tables
    db.create_all()
    print("✓ All tables created successfully!")
    print("New tables added:")
    print("  - patient_display_config")
    print("  - navigation_landmarks")
    print("  - patient_faqs")
    print("  - emergency_contacts")
