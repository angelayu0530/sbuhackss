from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from db import init_db, db
from models import *
from auth.routes import auth_bp
from chat.routes import chat_bp
from patients.routes import patients_bp
from tasks.routes import tasks_bp
from resources.routes import resources_bp
from conditions.routes import conditions_bp
from medications.routes import medications_bp
from recommendations.routes import recommendations_bp
from appointments.routes import appointments_bp
from patient_display.routes import patient_display_bp
from patient_alerts.routes import patient_alerts_bp
from socketio_instance import socketio
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')

# Initialize Socket.IO with the app
socketio.init_app(app)

CORS(app, 
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

@app.before_request
def handle_preflight():
    from flask import request
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

init_db(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(chat_bp, url_prefix='/chat')
app.register_blueprint(patients_bp, url_prefix='/patients')
app.register_blueprint(tasks_bp, url_prefix='/tasks')
app.register_blueprint(resources_bp, url_prefix='/resources')
app.register_blueprint(conditions_bp, url_prefix='/conditions')
app.register_blueprint(medications_bp, url_prefix='/medications')
app.register_blueprint(recommendations_bp, url_prefix='/recommendations')
app.register_blueprint(appointments_bp, url_prefix='/appointments')
app.register_blueprint(patient_display_bp, url_prefix='/patient-display')
app.register_blueprint(patient_alerts_bp, url_prefix='/patient-alerts')

@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_patient_room')
def handle_join_patient_room(data):
    """Mobile app joins a room to receive real-time updates"""
    from flask_socketio import join_room
    patient_id = data.get('patient_id')
    if patient_id:
        room = f'patient_{patient_id}'
        join_room(room)
        print(f'Patient {patient_id} joined room {room}')
        socketio.emit('room_joined', {'room': room, 'patient_id': patient_id})


if __name__ == '__main__':
    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(app, host='0.0.0.0', debug=True, port=5001, allow_unsafe_werkzeug=True)
