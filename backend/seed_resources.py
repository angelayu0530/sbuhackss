"""
Seed script to add sample community resources to the database
Run this script once to populate initial resources
"""

from main import app
from models import db, Resource
from datetime import datetime

def seed_resources():
    with app.app_context():
        # Check if resources already exist
        existing = Resource.query.count()
        if existing > 0:
            print(f"Resources already exist ({existing} found). Skipping seed.")
            return
        
        sample_resources = [
            {
                "title": "Weekly Community Health Walk",
                "category": "health",
                "description": "Join us for a free weekly health walk every Saturday morning at Central Park. Great for cardiovascular health and meeting neighbors!",
                "url": "https://example.com/health-walk"
            },
            {
                "title": "Caregiver Support Group",
                "category": "support groups",
                "description": "Monthly meetup for caregivers to share experiences, get advice, and find emotional support. Professional counselor facilitated.",
                "url": "https://example.com/caregiver-support"
            },
            {
                "title": "Free Health Screening Clinic",
                "category": "health",
                "description": "Free blood pressure, diabetes, and cholesterol screenings every first Tuesday of the month at Community Health Center.",
                "url": "https://example.com/health-screening"
            },
            {
                "title": "Nutrition and Wellness Workshop",
                "category": "educational",
                "description": "Learn about healthy eating, meal planning, and nutrition for chronic disease management. Free workshop with dietitian.",
                "url": "https://example.com/nutrition-workshop"
            },
            {
                "title": "Senior Social Hour",
                "category": "social",
                "description": "Weekly social gathering with games, music, and refreshments at the Community Center. All ages welcome!",
                "url": "https://example.com/senior-social"
            },
            {
                "title": "Medication Management Class",
                "category": "educational",
                "description": "Learn safe medication practices, avoiding drug interactions, and organizing medications. Free class by pharmacist.",
                "url": "https://example.com/medication-class"
            },
            {
                "title": "Yoga for Wellness",
                "category": "health",
                "description": "Gentle yoga classes adapted for seniors and those with mobility limitations. Monday and Thursday evenings.",
                "url": "https://example.com/yoga"
            },
            {
                "title": "Family Caregiver Training",
                "category": "educational",
                "description": "Comprehensive training program covering patient care, emergency response, and self-care for caregivers.",
                "url": "https://example.com/caregiver-training"
            },
            {
                "title": "Community Garden Project",
                "category": "social",
                "description": "Join our community garden where members grow vegetables and flowers together. Therapeutic and social activity.",
                "url": "https://example.com/garden"
            },
            {
                "title": "Mental Health Awareness Seminar",
                "category": "health",
                "description": "Learn about managing stress, anxiety, and depression for both caregivers and patients. Professional speakers.",
                "url": "https://example.com/mental-health"
            }
        ]
        
        for resource_data in sample_resources:
            resource = Resource(
                title=resource_data["title"],
                category=resource_data["category"],
                description=resource_data["description"],
                url=resource_data["url"],
                active=True,
                created_at=datetime.utcnow()
            )
            db.session.add(resource)
        
        db.session.commit()
        print(f"Successfully seeded {len(sample_resources)} resources!")

if __name__ == "__main__":
    seed_resources()
