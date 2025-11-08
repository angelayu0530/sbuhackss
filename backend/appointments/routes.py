from flask import Blueprint, request, jsonify
from models import Appointment, db

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['POST'])
def create_appointment():
    data = request.get_json()
    try:
        appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            location=data.get('location'),
            active=True
        )
        db.session.add(appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment created', 'aid': appointment.aid}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/<int:aid>', methods=['GET'])
def get_appointment(aid):
    appointment = Appointment.query.get(aid)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    return jsonify({
        'aid': appointment.aid,
        'patient_id': appointment.patient_id,
        'doctor_id': appointment.doctor_id,
        'start_time': appointment.start_time,
        'end_time': appointment.end_time,
        'location': appointment.location,
        'active': appointment.active,
        'created_at': appointment.created_at
    })

@appointments_bp.route('/', methods=['GET'])
def list_appointments():
    appointments = Appointment.query.all()
    return jsonify([
        {
            'aid': a.aid,
            'patient_id': a.patient_id,
            'doctor_id': a.doctor_id,
            'start_time': a.start_time,
            'end_time': a.end_time,
            'location': a.location,
            'active': a.active,
            'created_at': a.created_at
        } for a in appointments
    ])

@appointments_bp.route('/<int:aid>', methods=['PUT'])
def update_appointment(aid):
    data = request.get_json()
    appointment = Appointment.query.get(aid)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    try:
        appointment.patient_id = data.get('patient_id', appointment.patient_id)
        appointment.doctor_id = data.get('doctor_id', appointment.doctor_id)
        appointment.start_time = data.get('start_time', appointment.start_time)
        appointment.end_time = data.get('end_time', appointment.end_time)
        appointment.location = data.get('location', appointment.location)
        appointment.active = data.get('active', appointment.active)
        db.session.commit()
        return jsonify({'message': 'Appointment updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/<int:aid>', methods=['DELETE'])
def delete_appointment(aid):
    appointment = Appointment.query.get(aid)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
