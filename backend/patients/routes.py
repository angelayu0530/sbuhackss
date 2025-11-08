from flask import Blueprint, request, jsonify
from models import Patient, User, db
from datetime import datetime

patients_bp = Blueprint('patients', __name__)

# Handle OPTIONS requests for CORS preflight
@patients_bp.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

@patients_bp.route('/', methods=['POST', 'OPTIONS'])
def create_patient():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    required_fields = ['caretaker_id', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    caretaker = User.query.get(data['caretaker_id'])
    if not caretaker:
        return jsonify({'error': 'Caretaker not found'}), 404
    patient = Patient(
        caretaker_id=data['caretaker_id'],
        name=data['name'],
        age=data.get('age'),
        gender=data.get('gender'),
        medical_summary=data.get('medical_summary'),
        emergency_contact=data.get('emergency_contact'),
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(patient)
    db.session.commit()
    return jsonify({'message': 'Patient created', 'pid': patient.pid}), 201

@patients_bp.route('/<int:pid>', methods=['GET', 'OPTIONS'])
def get_patient(pid):
    if request.method == 'OPTIONS':
        return '', 200
    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify({
        'pid': patient.pid,
        'caretaker_id': patient.caretaker_id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'medical_summary': patient.medical_summary,
        'emergency_contact': patient.emergency_contact,
        'active': patient.active,
        'created_at': patient.created_at
    })

@patients_bp.route('/', methods=['GET', 'OPTIONS'])
def list_patients():
    if request.method == 'OPTIONS':
        return '', 200
    patients = Patient.query.all()
    return jsonify([
        {
            'pid': p.pid,
            'caretaker_id': p.caretaker_id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'medical_summary': p.medical_summary,
            'emergency_contact': p.emergency_contact,
            'active': p.active,
            'created_at': p.created_at
        } for p in patients
    ])

@patients_bp.route('/<int:pid>', methods=['PUT', 'OPTIONS'])
def update_patient(pid):
    if request.method == 'OPTIONS':
        return '', 200
    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    data = request.get_json()
    for field in ['name', 'age', 'gender', 'medical_summary', 'emergency_contact', 'active']:
        if field in data:
            setattr(patient, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Patient updated'})

@patients_bp.route('/<int:pid>', methods=['DELETE', 'OPTIONS'])
def delete_patient(pid):
    if request.method == 'OPTIONS':
        return '', 200
    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    db.session.delete(patient)
    db.session.commit()
    return jsonify({'message': 'Patient deleted'})
