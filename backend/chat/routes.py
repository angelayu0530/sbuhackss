from flask import Blueprint, request, jsonify
import google.genai as genai
from google.genai import types
from datetime import datetime, timedelta
from models import db, Appointment, Patient, Medication, Condition, Resource
import json

chat_bp = Blueprint('chat', __name__)

chat_sessions = {}
clients = {}
SESSION_ID = "default"

# Define AI function tools
def get_function_declarations():
    return [
        types.FunctionDeclaration(
            name="create_appointment",
            description="Create a new appointment/calendar event for the patient",
            parameters={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title or description of the appointment"
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Start time in HH:MM format (24-hour)"
                    },
                    "end_time": {
                        "type": "string",
                        "description": "End time in HH:MM format (24-hour)"
                    },
                    "location": {
                        "type": "string",
                        "description": "Location of the appointment"
                    }
                },
                "required": ["title", "date", "start_time", "end_time"]
            }
        ),
        types.FunctionDeclaration(
            name="generate_health_report",
            description="Generate a comprehensive health report for the patient including medications, conditions, and recent appointments",
            parameters={
                "type": "object",
                "properties": {
                    "patient_id": {
                        "type": "integer",
                        "description": "The patient ID to generate report for"
                    }
                },
                "required": ["patient_id"]
            }
        ),
        types.FunctionDeclaration(
            name="recommend_community_events",
            description="Recommend relevant community events and resources based on patient needs and interests",
            parameters={
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Category of events to recommend (e.g., 'health', 'social', 'educational', 'support groups')"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of recommendations to return"
                    }
                },
                "required": ["category"]
            }
        )
    ]

# Function implementations
def create_appointment_impl(title, date, start_time, end_time, location=None, patient_id=None, doctor_id=None):
    """Create a new appointment in the database"""
    try:
        # Parse datetime
        start_datetime = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
        end_datetime = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")
        
        # Create appointment
        appointment = Appointment(
            patient_id=patient_id or 1,  # Default patient if not provided
            doctor_id=doctor_id or 1,     # Default doctor if not provided
            start_time=start_datetime,
            end_time=end_datetime,
            location=location or title,
            active=True
        )
        db.session.add(appointment)
        db.session.commit()
        
        return {
            "success": True,
            "appointment_id": appointment.aid,
            "message": f"Appointment '{title}' created successfully for {date} from {start_time} to {end_time}"
        }
    except Exception as e:
        db.session.rollback()
        return {"success": False, "error": str(e)}

def generate_health_report_impl(patient_id):
    """Generate a health report for the patient"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}
        
        medications = Medication.query.filter_by(patient_id=patient_id, active=True).all()
        conditions = Condition.query.filter_by(patient_id=patient_id, active=True).all()
        appointments = Appointment.query.filter_by(patient_id=patient_id, active=True).order_by(Appointment.start_time.desc()).limit(5).all()
        
        report = {
            "patient_name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "medical_summary": patient.medical_summary,
            "emergency_contact": patient.emergency_contact,
            "medications": [
                {
                    "name": med.name,
                    "dose": med.dose,
                    "schedule": med.schedule_text,
                    "start_date": med.start_date.isoformat() if med.start_date else None
                } for med in medications
            ],
            "conditions": [
                {
                    "status": cond.status,
                    "onset_date": cond.onset_date.isoformat() if cond.onset_date else None,
                    "note": cond.note
                } for cond in conditions
            ],
            "recent_appointments": [
                {
                    "date": apt.start_time.isoformat(),
                    "location": apt.location
                } for apt in appointments
            ]
        }
        
        return {"success": True, "report": report}
    except Exception as e:
        return {"success": False, "error": str(e)}

def recommend_community_events_impl(category, limit=5):
    """Recommend community events based on category"""
    try:
        resources = Resource.query.filter_by(category=category, active=True).limit(limit).all()
        
        recommendations = [
            {
                "title": res.title,
                "description": res.description,
                "url": res.url,
                "category": res.category
            } for res in resources
        ]
        
        return {"success": True, "recommendations": recommendations}
    except Exception as e:
        return {"success": False, "error": str(e)}

@chat_bp.route('/gemini', methods=['POST', 'OPTIONS'])
def chat_gemini():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    user_message = data.get('message')
    clear_history = data.get('clearHistory', False)
    session_id = data.get('sessionId', SESSION_ID)
    patient_id = data.get('patientId')
    doctor_id = data.get('doctorId')
    
    try:
        if clear_history:
            if session_id in chat_sessions:
                del chat_sessions[session_id]
            if session_id in clients:
                del clients[session_id]
            return jsonify({'reply': 'Chat history cleared'})
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get or create client
        if session_id not in clients:
            clients[session_id] = genai.Client()
        
        # Create chat with function declarations
        if session_id not in chat_sessions:
            system_instruction = """You are a helpful healthcare assistant for caregivers managing patient care. 
            You can help with:
            1. Creating appointments and calendar events
            2. Generating health reports with patient information
            3. Recommending community events and resources
            
            Be friendly, clear, and helpful. When creating appointments, confirm the details with the user.
            Always prioritize patient safety and encourage users to consult healthcare professionals for medical decisions."""
            
            chat_sessions[session_id] = clients[session_id].chats.create(
                model="gemini-2.5-flash",
                config={
                    "system_instruction": system_instruction,
                    "tools": [types.Tool(function_declarations=get_function_declarations())]
                }
            )
        
        chat = chat_sessions[session_id]
        response = chat.send_message(user_message)
        
        # Handle function calls
        if response.candidates and response.candidates[0].content.parts:
            final_reply = ""
            
            for part in response.candidates[0].content.parts:
                if part.text:
                    final_reply += part.text
                elif hasattr(part, 'function_call') and part.function_call:
                    func_call = part.function_call
                    func_name = func_call.name
                    func_args = dict(func_call.args)
                    
                    # Execute the function
                    result = None
                    if func_name == "create_appointment":
                        result = create_appointment_impl(
                            title=func_args.get('title'),
                            date=func_args.get('date'),
                            start_time=func_args.get('start_time'),
                            end_time=func_args.get('end_time'),
                            location=func_args.get('location'),
                            patient_id=patient_id,
                            doctor_id=doctor_id
                        )
                    elif func_name == "generate_health_report":
                        result = generate_health_report_impl(
                            patient_id=func_args.get('patient_id', patient_id)
                        )
                    elif func_name == "recommend_community_events":
                        result = recommend_community_events_impl(
                            category=func_args.get('category'),
                            limit=func_args.get('limit', 5)
                        )
                    
                    # Send function result back to model
                    if result:
                        function_response = types.Part.from_function_response(
                            name=func_name,
                            response=result
                        )
                        follow_up = chat.send_message(function_response)
                        if follow_up.text:
                            final_reply += follow_up.text
            
            return jsonify({'reply': final_reply or response.text})
        
        return jsonify({'reply': response.text})
    except Exception as e:
        print(f"Chat error: {e}")
        import traceback
        traceback.print_exc()
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        if session_id in clients:
            del clients[session_id]
        return jsonify({'error': str(e)}), 500
