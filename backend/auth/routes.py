
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from models import User, db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        new_user = User(
            email=data['email'],
            name=data['name'],
            phone=data.get('phone')
        )
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(
            identity=new_user.uid,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'uid': new_user.uid,
                'email': new_user.email,
                'name': new_user.name,
                'phone': new_user.phone
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        if not user.active:
            return jsonify({'error': 'Account is deactivated'}), 403
        access_token = create_access_token(
            identity=user.uid,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'access_token': access_token,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'name': user.name,
                'phone': user.phone
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500