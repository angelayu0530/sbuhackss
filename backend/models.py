from flask_sqlalchemy import SQLAlchemy
import enum
from db import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class UserRole(enum.Enum):
    PATIENT = 'patient'
    CARETAKER = 'caretaker'
    DOCTOR = 'doctor'

class Gender(enum.Enum):
    WOMAN = "woman"
    MAN = "man"
    OTHER = "other"

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

class User(db.Model):
    __tablename__ = 'users'
    
    uid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum(UserRole), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Profile(db.Model):
    __tablename__ = 'profiles'
    
    pid = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), unique=True, nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.Enum(Gender))
    medical_summary = db.Column(db.Text)
    conditions = db.Column(db.Text)
    medications = db.Column(db.Text)
    emergency_contact = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)

class CaretakerPatient(db.Model):
    __tablename__ = 'caretaker_patient'
    
    cpid = db.Column(db.Integer, primary_key=True)
    caretaker_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    relationship = db.Column(db.String(50))
    primary_contact = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Task(db.Model):
    __tablename__ = 'tasks'
    
    tid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_at = db.Column(db.DateTime)
    status = db.Column(db.Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = db.Column(db.Enum(Priority), default=Priority.MEDIUM)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reminders = db.relationship('Reminder', backref='task')

class Note(db.Model):
    __tablename__ = 'notes'
    
    nid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    
    mid = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.String(50), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    role = db.Column(db.String(20))
    message_text = db.Column(db.Text, nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Reminder(db.Model):
    __tablename__ = 'reminders'
    
    rid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
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

# Health Records Models
class Condition(db.Model):
    __tablename__ = 'conditions'
    
    cid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    status = db.Column(db.String(50))
    onset_date = db.Column(db.DateTime)
    note = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Medication(db.Model):
    __tablename__ = 'medications'
    
    mid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    dose = db.Column(db.String(100))
    schedule_text = db.Column(db.Text)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    prescriber_id = db.Column(db.Integer, db.ForeignKey('users.uid'))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    aid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    rid = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    sources = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
