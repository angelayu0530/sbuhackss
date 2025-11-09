"""
Seed script to add sample patient display data for testing
Run this after setting up the patient display tables
"""
from main import app
from db import db
from models import Patient, PatientDisplayConfig, NavigationLandmark, PatientFAQ, EmergencyContact

def seed_patient_display_data():
    with app.app_context():
        # Get the first patient (or create one if needed)
        patient = Patient.query.first()
        
        if not patient:
            print("⚠️  No patients found. Please create a patient first through the UI.")
            return
        
        patient_id = patient.pid
        print(f"✓ Using patient: {patient.name} (ID: {patient_id})")
        
        # 1. Create display config
        config = PatientDisplayConfig.query.filter_by(patient_id=patient_id).first()
        if not config:
            config = PatientDisplayConfig(
                patient_id=patient_id,
                show_schedule=True,
                show_navigation=True,
                show_faq=True,
                home_address="123 Oak Street, Springfield, MA 01103",
                gps_tracking_enabled=False,
                geofence_radius_meters=500,
                voice_reminders_enabled=True,
                reminder_minutes_before=5,
                auto_mark_complete=True,
                caregiver_status="At work"
            )
            db.session.add(config)
            print("✓ Created display config")
        else:
            print("✓ Display config already exists")
        
        # 2. Add navigation landmarks
        landmarks_data = [
            {
                "step_number": 1,
                "title": "Exit Building",
                "description": "Go through the main entrance and turn right",
                "photo_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"
            },
            {
                "step_number": 2,
                "title": "Walk Past Oak Tree",
                "description": "Continue walking until you see the large oak tree on your left",
                "photo_url": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400"
            },
            {
                "step_number": 3,
                "title": "Corner Store",
                "description": "Turn left at the Stop & Shop corner store",
                "photo_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400"
            },
            {
                "step_number": 4,
                "title": "Your Street",
                "description": "Walk 2 blocks and your house is on the right (blue door)",
                "photo_url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400"
            }
        ]
        
        existing_landmarks = NavigationLandmark.query.filter_by(patient_id=patient_id, active=True).count()
        if existing_landmarks == 0:
            for data in landmarks_data:
                landmark = NavigationLandmark(patient_id=patient_id, **data)
                db.session.add(landmark)
            print(f"✓ Added {len(landmarks_data)} navigation landmarks")
        else:
            print(f"✓ {existing_landmarks} landmarks already exist")
        
        # 3. Add FAQs
        faqs_data = [
            {
                "question": "Where is Sarah?",
                "answer_text": "I'm at work right now. I'll be home at 5:00 PM. Love you! 💕",
                "order_index": 1
            },
            {
                "question": "How do I get home?",
                "answer_text": "Follow the navigation steps on your screen, or call me if you need help. I'm here for you!",
                "order_index": 2
            },
            {
                "question": "When is lunch?",
                "answer_text": "Lunch is at 12:30 PM today in the kitchen. I'll call you when it's ready!",
                "order_index": 3
            },
            {
                "question": "Did I take my medicine?",
                "answer_text": "Yes! You took your blue pill at 8:00 AM this morning. Great job remembering!",
                "order_index": 4
            },
            {
                "question": "What day is it?",
                "answer_text": "Today is Friday, November 8th, 2025. We're having chicken for dinner tonight!",
                "order_index": 5
            },
            {
                "question": "Can I go for a walk?",
                "answer_text": "Yes! Please use the navigation to stay nearby, or wait for me to come home at 5 PM and we can walk together.",
                "order_index": 6
            }
        ]
        
        existing_faqs = PatientFAQ.query.filter_by(patient_id=patient_id, active=True).count()
        if existing_faqs == 0:
            for data in faqs_data:
                faq = PatientFAQ(patient_id=patient_id, **data)
                db.session.add(faq)
            print(f"✓ Added {len(faqs_data)} FAQs")
        else:
            print(f"✓ {existing_faqs} FAQs already exist")
        
        # 4. Add emergency contacts
        contacts_data = [
            {
                "name": "Sarah Smith",
                "relationship": "Daughter",
                "phone": "555-0123",
                "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                "is_primary": True,
                "order_index": 1
            },
            {
                "name": "John Smith",
                "relationship": "Son",
                "phone": "555-0456",
                "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                "is_primary": False,
                "order_index": 2
            },
            {
                "name": "Dr. Rivera",
                "relationship": "Doctor",
                "phone": "555-7890",
                "photo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
                "is_primary": False,
                "order_index": 3
            }
        ]
        
        existing_contacts = EmergencyContact.query.filter_by(patient_id=patient_id, active=True).count()
        if existing_contacts == 0:
            for data in contacts_data:
                contact = EmergencyContact(patient_id=patient_id, **data)
                db.session.add(contact)
            print(f"✓ Added {len(contacts_data)} emergency contacts")
        else:
            print(f"✓ {existing_contacts} contacts already exist")
        
        # Commit all changes
        db.session.commit()
        print("\n✅ Sample data seeded successfully!")
        print("\n📱 Next steps:")
        print("1. Open your dashboard at http://localhost:5173")
        print("2. Click the 'Patient Mobile App' tab")
        print("3. You should see all the sample data!")
        print("4. Try editing FAQs or adding new landmarks")
        print("5. Build the mobile app to test real-time sync!")

if __name__ == '__main__':
    seed_patient_display_data()
