from flask import Blueprint, request, jsonify
from models import Condition, Patient, db
from datetime import datetime

conditions_bp = Blueprint('conditions', __name__)

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
