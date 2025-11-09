from flask_sqlalchemy import SQLAlchemy
import enum
from db import db
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash
import os
os.environ["WERKZEUG_PASSWORD_HASH"] = "pbkdf2:sha256"


class User(db.Model):
    __tablename__ = 'users'

    uid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Patient(db.Model):
    __tablename__ = 'patients'

    pid = db.Column(db.Integer, primary_key=True)
    caretaker_id = db.Column(db.Integer, db.ForeignKey('users.uid'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    medical_summary = db.Column(db.Text)
    emergency_contact = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    caretaker = db.relationship('User', backref=db.backref('patient', uselist=False))



import enum

class TaskStatus(enum.Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class Priority(enum.Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'

class Task(db.Model):
    __tablename__ = 'tasks'

    tid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    caretaker_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_at = db.Column(db.DateTime)
    status = db.Column(db.Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    priority = db.Column(db.Enum(Priority), default=Priority.MEDIUM, nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='tasks')
    caretaker = db.relationship('User', backref='tasks')
    reminders = db.relationship('Reminder', backref='task', cascade="all, delete-orphan")


class Reminder(db.Model):
    __tablename__ = 'reminders'

    rid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.tid'), nullable=False)
    channel = db.Column(db.String(20))
    remind_at = db.Column(db.DateTime, nullable=False)
    sent = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)


class Resource(db.Model):
    __tablename__ = 'resources'

    rid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    url = db.Column(db.String(500))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Condition(db.Model):
    __tablename__ = 'conditions'

    cid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    status = db.Column(db.String(50))
    onset_date = db.Column(db.DateTime)
    note = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='conditions')


class Medication(db.Model):
    __tablename__ = 'medications'

    mid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    dose = db.Column(db.String(100))
    schedule_text = db.Column(db.Text)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    prescriber_id = db.Column(db.Integer, db.ForeignKey('users.uid'))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='medications')
    prescriber = db.relationship('User', backref='prescriptions')


class Appointment(db.Model):
    __tablename__ = 'appointments'

    aid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('User', backref='appointments')


class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    rid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    sources = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='recommendations')


# Patient Display Configuration for Mobile App
class PatientDisplayConfig(db.Model):
    __tablename__ = 'patient_display_config'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), unique=True, nullable=False)
    show_schedule = db.Column(db.Boolean, default=True)
    show_navigation = db.Column(db.Boolean, default=True)
    show_faq = db.Column(db.Boolean, default=True)
    home_address = db.Column(db.String(300))
    gps_tracking_enabled = db.Column(db.Boolean, default=False)
    geofence_radius_meters = db.Column(db.Integer, default=500)
    voice_reminders_enabled = db.Column(db.Boolean, default=True)
    reminder_minutes_before = db.Column(db.Integer, default=5)
    auto_mark_complete = db.Column(db.Boolean, default=True)
    caregiver_status = db.Column(db.String(100))  # "At work", "At home", etc.
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('display_config', uselist=False))


# Navigation Landmarks for "How to Get Home"
class NavigationLandmark(db.Model):
    __tablename__ = 'navigation_landmarks'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    photo_url = db.Column(db.String(500))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='navigation_landmarks')


# FAQ for repetitive questions
class PatientFAQ(db.Model):
    __tablename__ = 'patient_faqs'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    question = db.Column(db.String(300), nullable=False)
    answer_text = db.Column(db.Text, nullable=False)
    voice_recording_url = db.Column(db.String(500))
    order_index = db.Column(db.Integer, default=0)  # For sorting most common questions
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('Patient', backref='faqs')


# Emergency contacts for patient
class EmergencyContact(db.Model):
    __tablename__ = 'emergency_contacts'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.pid'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    relationship = db.Column(db.String(50))  # "Daughter", "Son", etc.
    phone = db.Column(db.String(20), nullable=False)
    photo_url = db.Column(db.String(500))
    is_primary = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='emergency_contacts')