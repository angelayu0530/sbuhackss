from flask import Blueprint, request, jsonify
from models import Recommendation, Patient, db
from datetime import datetime

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/', methods=['POST'])
def create_recommendation():
    data = request.get_json()
    required_fields = ['patient_id', 'title']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    recommendation = Recommendation(
        patient_id=data['patient_id'],
        title=data['title'],
        sources=data.get('sources'),
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(recommendation)
    db.session.commit()
    return jsonify({'message': 'Recommendation created', 'rid': recommendation.rid}), 201

@recommendations_bp.route('/<int:rid>', methods=['GET'])
def get_recommendation(rid):
    recommendation = Recommendation.query.get(rid)
    if not recommendation:
        return jsonify({'error': 'Recommendation not found'}), 404
    return jsonify({
        'rid': recommendation.rid,
        'patient_id': recommendation.patient_id,
        'title': recommendation.title,
        'sources': recommendation.sources,
        'active': recommendation.active,
        'created_at': recommendation.created_at
    })

@recommendations_bp.route('/', methods=['GET'])
def list_recommendations():
    recommendations = Recommendation.query.all()
    return jsonify([
        {
            'rid': r.rid,
            'patient_id': r.patient_id,
            'title': r.title,
            'sources': r.sources,
            'active': r.active,
            'created_at': r.created_at
        } for r in recommendations
    ])

@recommendations_bp.route('/<int:rid>', methods=['PUT'])
def update_recommendation(rid):
    recommendation = Recommendation.query.get(rid)
    if not recommendation:
        return jsonify({'error': 'Recommendation not found'}), 404
    data = request.get_json()
    for field in ['title', 'sources', 'active']:
        if field in data:
            setattr(recommendation, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Recommendation updated'})

@recommendations_bp.route('/<int:rid>', methods=['DELETE'])
def delete_recommendation(rid):
    recommendation = Recommendation.query.get(rid)
    if not recommendation:
        return jsonify({'error': 'Recommendation not found'}), 404
    db.session.delete(recommendation)
    db.session.commit()
    return jsonify({'message': 'Recommendation deleted'})
