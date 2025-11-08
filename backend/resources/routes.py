from flask import Blueprint, request, jsonify
from models import Resource, db
from datetime import datetime

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/', methods=['POST'])
def create_resource():
    data = request.get_json()
    required_fields = ['title']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    resource = Resource(
        title=data['title'],
        category=data.get('category'),
        description=data.get('description'),
        url=data.get('url'),
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(resource)
    db.session.commit()
    return jsonify({'message': 'Resource created', 'rid': resource.rid}), 201

@resources_bp.route('/<int:rid>', methods=['GET'])
def get_resource(rid):
    resource = Resource.query.get(rid)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    return jsonify({
        'rid': resource.rid,
        'title': resource.title,
        'category': resource.category,
        'description': resource.description,
        'url': resource.url,
        'active': resource.active,
        'created_at': resource.created_at
    })

@resources_bp.route('/', methods=['GET'])
def list_resources():
    resources = Resource.query.all()
    return jsonify([
        {
            'rid': r.rid,
            'title': r.title,
            'category': r.category,
            'description': r.description,
            'url': r.url,
            'active': r.active,
            'created_at': r.created_at
        } for r in resources
    ])

@resources_bp.route('/<int:rid>', methods=['PUT'])
def update_resource(rid):
    resource = Resource.query.get(rid)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    data = request.get_json()
    for field in ['title', 'category', 'description', 'url', 'active']:
        if field in data:
            setattr(resource, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Resource updated'})

@resources_bp.route('/<int:rid>', methods=['DELETE'])
def delete_resource(rid):
    resource = Resource.query.get(rid)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    db.session.delete(resource)
    db.session.commit()
    return jsonify({'message': 'Resource deleted'})
