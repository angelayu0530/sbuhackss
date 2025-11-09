from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import db
from models import (
    Patient, PatientDisplayConfig, NavigationLandmark, 
    PatientFAQ, EmergencyContact, Appointment, Task, Medication
)
from socketio_instance import socketio
from datetime import datetime

patient_display_bp = Blueprint('patient_display', __name__)


# ==================== CONFIGURATION ENDPOINTS ====================

@patient_display_bp.route('/config/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_display_config(patient_id):
    """Get patient display configuration"""
    config = PatientDisplayConfig.query.filter_by(patient_id=patient_id, active=True).first()
    
    if not config:
        # Create default config if doesn't exist
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        config = PatientDisplayConfig(patient_id=patient_id)
        db.session.add(config)
        db.session.commit()
    
    return jsonify({
        "id": config.id,
        "patient_id": config.patient_id,
        "show_schedule": config.show_schedule,
        "show_navigation": config.show_navigation,
        "show_faq": config.show_faq,
        "home_address": config.home_address,
        "gps_tracking_enabled": config.gps_tracking_enabled,
        "geofence_radius_meters": config.geofence_radius_meters,
        "voice_reminders_enabled": config.voice_reminders_enabled,
        "reminder_minutes_before": config.reminder_minutes_before,
        "auto_mark_complete": config.auto_mark_complete,
        "caregiver_status": config.caregiver_status,
    })


@patient_display_bp.route('/config/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_display_config(patient_id):
    """Update patient display configuration"""
    config = PatientDisplayConfig.query.filter_by(patient_id=patient_id).first()
    
    if not config:
        config = PatientDisplayConfig(patient_id=patient_id)
        db.session.add(config)
    
    data = request.get_json()
    
    # Update fields
    if 'show_schedule' in data:
        config.show_schedule = data['show_schedule']
    if 'show_navigation' in data:
        config.show_navigation = data['show_navigation']
    if 'show_faq' in data:
        config.show_faq = data['show_faq']
    if 'home_address' in data:
        config.home_address = data['home_address']
    if 'gps_tracking_enabled' in data:
        config.gps_tracking_enabled = data['gps_tracking_enabled']
    if 'geofence_radius_meters' in data:
        config.geofence_radius_meters = data['geofence_radius_meters']
    if 'voice_reminders_enabled' in data:
        config.voice_reminders_enabled = data['voice_reminders_enabled']
    if 'reminder_minutes_before' in data:
        config.reminder_minutes_before = data['reminder_minutes_before']
    if 'auto_mark_complete' in data:
        config.auto_mark_complete = data['auto_mark_complete']
    if 'caregiver_status' in data:
        config.caregiver_status = data['caregiver_status']
    
    config.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Broadcast update to patient's mobile app
    socketio.emit('config_updated', {
        'patient_id': patient_id,
        'config': {
            'show_schedule': config.show_schedule,
            'show_navigation': config.show_navigation,
            'show_faq': config.show_faq,
            'caregiver_status': config.caregiver_status,
        }
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Configuration updated", "id": config.id})


# ==================== NAVIGATION LANDMARKS ====================

@patient_display_bp.route('/landmarks/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_landmarks(patient_id):
    """Get all navigation landmarks for patient"""
    landmarks = NavigationLandmark.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(NavigationLandmark.step_number).all()
    
    return jsonify([{
        "id": l.id,
        "step_number": l.step_number,
        "title": l.title,
        "description": l.description,
        "photo_url": l.photo_url,
    } for l in landmarks])


@patient_display_bp.route('/landmarks/<int:patient_id>', methods=['POST'])
@jwt_required()
def create_landmark(patient_id):
    """Create a new navigation landmark"""
    data = request.get_json()
    
    landmark = NavigationLandmark(
        patient_id=patient_id,
        step_number=data.get('step_number', 1),
        title=data['title'],
        description=data.get('description'),
        photo_url=data.get('photo_url')
    )
    
    db.session.add(landmark)
    db.session.commit()
    
    # Broadcast to mobile app
    socketio.emit('landmarks_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Landmark created", "id": landmark.id}), 201


@patient_display_bp.route('/landmarks/<int:landmark_id>', methods=['PUT'])
@jwt_required()
def update_landmark(landmark_id):
    """Update a navigation landmark"""
    landmark = NavigationLandmark.query.get_or_404(landmark_id)
    data = request.get_json()
    
    if 'step_number' in data:
        landmark.step_number = data['step_number']
    if 'title' in data:
        landmark.title = data['title']
    if 'description' in data:
        landmark.description = data['description']
    if 'photo_url' in data:
        landmark.photo_url = data['photo_url']
    
    db.session.commit()
    
    # Broadcast update
    socketio.emit('landmarks_updated', {
        'patient_id': landmark.patient_id,
    }, room=f'patient_{landmark.patient_id}')
    
    return jsonify({"message": "Landmark updated"})


@patient_display_bp.route('/landmarks/<int:landmark_id>', methods=['DELETE'])
@jwt_required()
def delete_landmark(landmark_id):
    """Delete a navigation landmark"""
    landmark = NavigationLandmark.query.get_or_404(landmark_id)
    patient_id = landmark.patient_id
    
    landmark.active = False
    db.session.commit()
    
    # Broadcast update
    socketio.emit('landmarks_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Landmark deleted"})


# ==================== FAQ ENDPOINTS ====================

@patient_display_bp.route('/faqs/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_faqs(patient_id):
    """Get all FAQs for patient"""
    faqs = PatientFAQ.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(PatientFAQ.order_index).all()
    
    return jsonify([{
        "id": f.id,
        "question": f.question,
        "answer_text": f.answer_text,
        "voice_recording_url": f.voice_recording_url,
        "order_index": f.order_index,
    } for f in faqs])


@patient_display_bp.route('/faqs/<int:patient_id>', methods=['POST'])
@jwt_required()
def create_faq(patient_id):
    """Create a new FAQ"""
    data = request.get_json()
    
    faq = PatientFAQ(
        patient_id=patient_id,
        question=data['question'],
        answer_text=data['answer_text'],
        voice_recording_url=data.get('voice_recording_url'),
        order_index=data.get('order_index', 0)
    )
    
    db.session.add(faq)
    db.session.commit()
    
    # Broadcast to mobile app
    socketio.emit('faqs_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "FAQ created", "id": faq.id}), 201


@patient_display_bp.route('/faqs/<int:faq_id>', methods=['PUT'])
@jwt_required()
def update_faq(faq_id):
    """Update an FAQ"""
    faq = PatientFAQ.query.get_or_404(faq_id)
    data = request.get_json()
    
    if 'question' in data:
        faq.question = data['question']
    if 'answer_text' in data:
        faq.answer_text = data['answer_text']
    if 'voice_recording_url' in data:
        faq.voice_recording_url = data['voice_recording_url']
    if 'order_index' in data:
        faq.order_index = data['order_index']
    
    faq.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Broadcast update
    socketio.emit('faqs_updated', {
        'patient_id': faq.patient_id,
    }, room=f'patient_{faq.patient_id}')
    
    return jsonify({"message": "FAQ updated"})


@patient_display_bp.route('/faqs/<int:faq_id>', methods=['DELETE'])
@jwt_required()
def delete_faq(faq_id):
    """Delete an FAQ"""
    faq = PatientFAQ.query.get_or_404(faq_id)
    patient_id = faq.patient_id
    
    faq.active = False
    db.session.commit()
    
    # Broadcast update
    socketio.emit('faqs_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "FAQ deleted"})


# ==================== EMERGENCY CONTACTS ====================

@patient_display_bp.route('/contacts/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_contacts(patient_id):
    """Get all emergency contacts for patient"""
    contacts = EmergencyContact.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(EmergencyContact.order_index).all()
    
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "relationship": c.relationship,
        "phone": c.phone,
        "photo_url": c.photo_url,
        "is_primary": c.is_primary,
    } for c in contacts])


@patient_display_bp.route('/contacts/<int:patient_id>', methods=['POST'])
@jwt_required()
def create_contact(patient_id):
    """Create a new emergency contact"""
    data = request.get_json()
    
    contact = EmergencyContact(
        patient_id=patient_id,
        name=data['name'],
        relationship=data.get('relationship'),
        phone=data['phone'],
        photo_url=data.get('photo_url'),
        is_primary=data.get('is_primary', False),
        order_index=data.get('order_index', 0)
    )
    
    db.session.add(contact)
    db.session.commit()
    
    # Broadcast to mobile app
    socketio.emit('contacts_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Contact created", "id": contact.id}), 201


@patient_display_bp.route('/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    """Update an emergency contact"""
    contact = EmergencyContact.query.get_or_404(contact_id)
    data = request.get_json()
    
    if 'name' in data:
        contact.name = data['name']
    if 'relationship' in data:
        contact.relationship = data['relationship']
    if 'phone' in data:
        contact.phone = data['phone']
    if 'photo_url' in data:
        contact.photo_url = data['photo_url']
    if 'is_primary' in data:
        contact.is_primary = data['is_primary']
    
    db.session.commit()
    
    # Broadcast update
    socketio.emit('contacts_updated', {
        'patient_id': contact.patient_id,
    }, room=f'patient_{contact.patient_id}')
    
    return jsonify({"message": "Contact updated"})


@patient_display_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    """Delete an emergency contact"""
    contact = EmergencyContact.query.get_or_404(contact_id)
    patient_id = contact.patient_id
    
    contact.active = False
    db.session.commit()
    
    # Broadcast update
    socketio.emit('contacts_updated', {
        'patient_id': patient_id,
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Contact deleted"})


# ==================== MOBILE APP DATA ENDPOINTS ====================

@patient_display_bp.route('/mobile/<int:patient_id>/home', methods=['GET'])
def get_mobile_home_data(patient_id):
    """Get all data for patient mobile app home screen (no auth required for patient)"""
    
    # Get config
    config = PatientDisplayConfig.query.filter_by(patient_id=patient_id).first()
    
    # Get today's schedule
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59)
    
    appointments = []
    if config and config.show_schedule:
        appointments = Appointment.query.filter(
            Appointment.patient_id == patient_id,
            Appointment.start_time >= today_start,
            Appointment.start_time <= today_end,
            Appointment.active == True
        ).order_by(Appointment.start_time).all()
    
    return jsonify({
        "patient_id": patient_id,
        "caregiver_status": config.caregiver_status if config else None,
        "home_address": config.home_address if config else None,
        "schedule": [{
            "id": a.aid,
            "start_time": a.start_time.isoformat(),
            "end_time": a.end_time.isoformat(),
            "location": a.location,
        } for a in appointments],
    })


@patient_display_bp.route('/mobile/<int:patient_id>/schedule', methods=['GET'])
def get_mobile_schedule(patient_id):
    """Get full schedule for patient mobile app"""
    
    # Get appointments for the week
    appointments = Appointment.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(Appointment.start_time).all()
    
    return jsonify([{
        "id": a.aid,
        "start_time": a.start_time.isoformat(),
        "end_time": a.end_time.isoformat(),
        "location": a.location,
    } for a in appointments])


@patient_display_bp.route('/mobile/<int:patient_id>/navigation', methods=['GET'])
def get_mobile_navigation(patient_id):
    """Get navigation home data for mobile app"""
    
    config = PatientDisplayConfig.query.filter_by(patient_id=patient_id).first()
    landmarks = NavigationLandmark.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(NavigationLandmark.step_number).all()
    
    return jsonify({
        "home_address": config.home_address if config else None,
        "landmarks": [{
            "step_number": l.step_number,
            "title": l.title,
            "description": l.description,
            "photo_url": l.photo_url,
        } for l in landmarks]
    })


@patient_display_bp.route('/mobile/<int:patient_id>/faqs', methods=['GET'])
def get_mobile_faqs(patient_id):
    """Get FAQs for mobile app"""
    
    faqs = PatientFAQ.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(PatientFAQ.order_index).all()
    
    return jsonify([{
        "id": f.id,
        "question": f.question,
        "answer_text": f.answer_text,
        "voice_recording_url": f.voice_recording_url,
    } for f in faqs])


@patient_display_bp.route('/mobile/<int:patient_id>/contacts', methods=['GET'])
def get_mobile_contacts(patient_id):
    """Get emergency contacts for mobile app"""
    
    contacts = EmergencyContact.query.filter_by(
        patient_id=patient_id, 
        active=True
    ).order_by(EmergencyContact.order_index).all()
    
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "relationship": c.relationship,
        "phone": c.phone,
        "photo_url": c.photo_url,
        "is_primary": c.is_primary,
    } for c in contacts])


# ==================== URGENT MESSAGING ====================

@patient_display_bp.route('/urgent-message/<int:patient_id>', methods=['POST'])
@jwt_required()
def send_urgent_message(patient_id):
    """Send urgent message to patient's mobile app"""
    data = request.get_json()
    message = data.get('message', '')
    
    # Broadcast urgent message
    socketio.emit('urgent_message', {
        'patient_id': patient_id,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }, room=f'patient_{patient_id}')
    
    return jsonify({"message": "Urgent message sent"})
