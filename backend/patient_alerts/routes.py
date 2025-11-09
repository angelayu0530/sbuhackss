from flask import Blueprint, request, jsonify
from db import db
from datetime import datetime
from sqlalchemy import text
from socketio_instance import socketio

patient_alerts_bp = Blueprint('patient_alerts', __name__)

@patient_alerts_bp.route('/call-caregiver', methods=['POST'])
def call_caregiver_alert():
    """Send alert when patient calls caregiver"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        caregiver_name = data.get('caregiver_name', 'Caregiver')
        caregiver_phone = data.get('caregiver_phone', 'Unknown')
        
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        # Get patient and caregiver info
        query = text("""
            SELECT p.name as patient_name, p.caretaker_id, u.name as caregiver_name
            FROM patients p
            JOIN users u ON p.caretaker_id = u.uid
            WHERE p.pid = :patient_id
        """)
        result = db.session.execute(query, {'patient_id': patient_id}).fetchone()
        
        if not result:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient_name = result.patient_name
        caretaker_id = result.caretaker_id
        actual_caregiver_name = result.caregiver_name
        
        # Create alert message
        alert_data = {
            'type': 'call_request',
            'patient_id': patient_id,
            'patient_name': patient_name,
            'caregiver_name': actual_caregiver_name,
            'message': f'{patient_name} is calling {caregiver_name} ({caregiver_phone})',
            'timestamp': datetime.utcnow().isoformat(),
            'priority': 'high'
        }
        
        # Emit to caregiver's room
        socketio.emit('patient_alert', alert_data, room=f'caregiver_{caretaker_id}')
        
        # Also emit to general caregiver dashboard
        socketio.emit('new_alert', alert_data, broadcast=True)
        
        return jsonify({
            'success': True,
            'message': 'Alert sent to caregiver',
            'alert': alert_data
        }), 200
        
    except Exception as e:
        print(f"Error sending call alert: {e}")
        return jsonify({'error': str(e)}), 500


@patient_alerts_bp.route('/emergency-call', methods=['POST'])
def emergency_call_alert():
    """Send alert when patient calls 911"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        # Get patient and caregiver info
        query = text("""
            SELECT p.name as patient_name, p.caretaker_id, u.name as caregiver_name
            FROM patients p
            JOIN users u ON p.caretaker_id = u.uid
            WHERE p.pid = :patient_id
        """)
        result = db.session.execute(query, {'patient_id': patient_id}).fetchone()
        
        if not result:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient_name = result.patient_name
        caretaker_id = result.caretaker_id
        caregiver_name = result.caregiver_name
        
        # Create emergency alert
        alert_data = {
            'type': 'emergency_911',
            'patient_id': patient_id,
            'patient_name': patient_name,
            'message': f'🚨 EMERGENCY: {patient_name} is calling 911!',
            'timestamp': datetime.utcnow().isoformat(),
            'priority': 'urgent'
        }
        
        # Emit to caregiver's room
        socketio.emit('patient_alert', alert_data, room=f'caregiver_{caretaker_id}')
        
        # Broadcast emergency alert
        socketio.emit('emergency_alert', alert_data, broadcast=True)
        
        return jsonify({
            'success': True,
            'message': 'Emergency alert sent to caregiver',
            'alert': alert_data
        }), 200
        
    except Exception as e:
        print(f"Error sending emergency alert: {e}")
        return jsonify({'error': str(e)}), 500


@patient_alerts_bp.route('/navigation-help', methods=['POST'])
def navigation_help_alert():
    """Send alert when patient uses 'Take Me Home' feature"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        location = data.get('location', {})
        latitude = location.get('latitude')
        longitude = location.get('longitude')
        address = location.get('address', 'Unknown location')
        
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        # Get patient and caregiver info
        query = text("""
            SELECT p.name as patient_name, p.caretaker_id, u.name as caregiver_name
            FROM patients p
            JOIN users u ON p.caretaker_id = u.uid
            WHERE p.pid = :patient_id
        """)
        result = db.session.execute(query, {'patient_id': patient_id}).fetchone()
        
        if not result:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient_name = result.patient_name
        caretaker_id = result.caretaker_id
        caregiver_name = result.caregiver_name
        
        # Create navigation alert
        alert_data = {
            'type': 'navigation_help',
            'patient_id': patient_id,
            'patient_name': patient_name,
            'message': f'📍 {patient_name} needs help getting home',
            'location': {
                'latitude': latitude,
                'longitude': longitude,
                'address': address
            },
            'timestamp': datetime.utcnow().isoformat(),
            'priority': 'urgent'
        }
        
        # Emit to caregiver's room
        socketio.emit('patient_alert', alert_data, room=f'caregiver_{caretaker_id}')
        
        # Broadcast location alert
        socketio.emit('location_alert', alert_data, broadcast=True)
        
        return jsonify({
            'success': True,
            'message': 'Navigation alert sent to caregiver',
            'alert': alert_data
        }), 200
        
    except Exception as e:
        print(f"Error sending navigation alert: {e}")
        return jsonify({'error': str(e)}), 500


@socketio.on('join_caregiver_room')
def handle_join_caregiver_room(data):
    """Caregiver joins their room to receive alerts"""
    from flask_socketio import join_room
    caregiver_id = data.get('caregiver_id')
    if caregiver_id:
        room = f'caregiver_{caregiver_id}'
        join_room(room)
        print(f'Caregiver {caregiver_id} joined room {room}')
        socketio.emit('room_joined', {'room': room, 'caregiver_id': caregiver_id})
