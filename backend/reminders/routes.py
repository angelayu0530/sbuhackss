from flask import Blueprint, request, jsonify
from models import Reminder, db

reminders_bp = Blueprint('reminders', __name__)

@reminders_bp.route('/appointment', methods=['POST'])
def create_reminder_for_appointment():
    data = request.get_json()
    try:
        reminder = Reminder(
            patient_id=data['patient_id'],
            task_id=data.get('task_id'),
            channel=data.get('channel'),
            remind_at=data['remind_at'],
            active=True
        )
        db.session.add(reminder)
        db.session.commit()
        return jsonify({'message': 'Reminder created', 'reminder_id': reminder.rid}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reminders_bp.route('/appointment/<int:appointment_id>', methods=['GET'])
def get_reminders_for_appointment(appointment_id):
    reminders = Reminder.query.filter_by(task_id=appointment_id).all()
    return jsonify([{
        'rid': r.rid,
        'patient_id': r.patient_id,
        'task_id': r.task_id,
        'channel': r.channel,
        'remind_at': r.remind_at,
        'active': r.active
    } for r in reminders])
