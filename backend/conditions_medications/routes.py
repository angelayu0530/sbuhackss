from flask import Blueprint, request, jsonify
from models import Condition, Medication, Patient, User, db
from datetime import datetime

conditions_bp = Blueprint('conditions', __name__)
medications_bp = Blueprint('medications', __name__)

# --- Condition Routes ---
@conditions_bp.route('/', methods=['POST'])
def create_condition():
    data = request.get_json()
    required_fields = ['patient_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    condition = Condition(
        patient_id=data['patient_id'],
        status=data.get('status'),
        onset_date=data.get('onset_date'),
        note=data.get('note'),
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(condition)
    db.session.commit()
    return jsonify({'message': 'Condition created', 'cid': condition.cid}), 201

@conditions_bp.route('/<int:cid>', methods=['GET'])
def get_condition(cid):
    condition = Condition.query.get(cid)
    if not condition:
        return jsonify({'error': 'Condition not found'}), 404
    return jsonify({
        'cid': condition.cid,
        'patient_id': condition.patient_id,
        'status': condition.status,
        'onset_date': condition.onset_date,
        'note': condition.note,
        'active': condition.active,
        'created_at': condition.created_at
    })

@conditions_bp.route('/', methods=['GET'])
def list_conditions():
    conditions = Condition.query.all()
    return jsonify([
        {
            'cid': c.cid,
            'patient_id': c.patient_id,
            'status': c.status,
            'onset_date': c.onset_date,
            'note': c.note,
            'active': c.active,
            'created_at': c.created_at
        } for c in conditions
    ])

@conditions_bp.route('/<int:cid>', methods=['PUT'])
def update_condition(cid):
    condition = Condition.query.get(cid)
    if not condition:
        return jsonify({'error': 'Condition not found'}), 404
    data = request.get_json()
    for field in ['status', 'onset_date', 'note', 'active']:
        if field in data:
            setattr(condition, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Condition updated'})

@conditions_bp.route('/<int:cid>', methods=['DELETE'])
def delete_condition(cid):
    condition = Condition.query.get(cid)
    if not condition:
        return jsonify({'error': 'Condition not found'}), 404
    db.session.delete(condition)
    db.session.commit()
    return jsonify({'message': 'Condition deleted'})

# --- Medication Routes ---
@medications_bp.route('/', methods=['POST'])
def create_medication():
    data = request.get_json()
    required_fields = ['patient_id', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    prescriber = None
    if data.get('prescriber_id'):
        prescriber = User.query.get(data['prescriber_id'])
        if not prescriber:
            return jsonify({'error': 'Prescriber not found'}), 404
    medication = Medication(
        patient_id=data['patient_id'],
        name=data['name'],
        dose=data.get('dose'),
        schedule_text=data.get('schedule_text'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        prescriber_id=data.get('prescriber_id'),
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(medication)
    db.session.commit()
    return jsonify({'message': 'Medication created', 'mid': medication.mid}), 201

@medications_bp.route('/<int:mid>', methods=['GET'])
def get_medication(mid):
    medication = Medication.query.get(mid)
    if not medication:
        return jsonify({'error': 'Medication not found'}), 404
    return jsonify({
        'mid': medication.mid,
        'patient_id': medication.patient_id,
        'name': medication.name,
        'dose': medication.dose,
        'schedule_text': medication.schedule_text,
        'start_date': medication.start_date,
        'end_date': medication.end_date,
        'prescriber_id': medication.prescriber_id,
        'active': medication.active,
        'created_at': medication.created_at
    })

@medications_bp.route('/', methods=['GET'])
def list_medications():
    medications = Medication.query.all()
    return jsonify([
        {
            'mid': m.mid,
            'patient_id': m.patient_id,
            'name': m.name,
            'dose': m.dose,
            'schedule_text': m.schedule_text,
            'start_date': m.start_date,
            'end_date': m.end_date,
            'prescriber_id': m.prescriber_id,
            'active': m.active,
            'created_at': m.created_at
        } for m in medications
    ])

@medications_bp.route('/<int:mid>', methods=['PUT'])
def update_medication(mid):
    medication = Medication.query.get(mid)
    if not medication:
        return jsonify({'error': 'Medication not found'}), 404
    data = request.get_json()
    for field in ['name', 'dose', 'schedule_text', 'start_date', 'end_date', 'prescriber_id', 'active']:
        if field in data:
            setattr(medication, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Medication updated'})

@medications_bp.route('/<int:mid>', methods=['DELETE'])
def delete_medication(mid):
    medication = Medication.query.get(mid)
    if not medication:
        return jsonify({'error': 'Medication not found'}), 404
    db.session.delete(medication)
    db.session.commit()
    return jsonify({'message': 'Medication deleted'})
