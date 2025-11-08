from flask import Blueprint, request, jsonify
from models import Task, Patient, User, db, TaskStatus, Priority
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__)

# Handle OPTIONS requests for CORS preflight
@tasks_bp.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

@tasks_bp.route('/', methods=['POST', 'OPTIONS'])
def create_task():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    required_fields = ['patient_id', 'caretaker_id', 'title']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    patient = Patient.query.get(data['patient_id'])
    caretaker = User.query.get(data['caretaker_id'])
    if not patient or not caretaker:
        return jsonify({'error': 'Patient or caretaker not found'}), 404
    try:
        status = TaskStatus(data.get('status', 'pending'))
    except Exception:
        status = TaskStatus.PENDING
    try:
        priority = Priority(data.get('priority', 'medium'))
    except Exception:
        priority = Priority.MEDIUM
    task = Task(
        patient_id=data['patient_id'],
        caretaker_id=data['caretaker_id'],
        title=data['title'],
        description=data.get('description'),
        due_at=data.get('due_at'),
        status=status,
        priority=priority,
        active=data.get('active', True),
        created_at=datetime.utcnow()
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task created', 'tid': task.tid}), 201

@tasks_bp.route('/<int:tid>', methods=['GET', 'OPTIONS'])
def get_task(tid):
    if request.method == 'OPTIONS':
        return '', 200
    task = Task.query.get(tid)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({
        'tid': task.tid,
        'patient_id': task.patient_id,
        'caretaker_id': task.caretaker_id,
        'title': task.title,
        'description': task.description,
        'due_at': task.due_at,
        'status': task.status.value,
        'priority': task.priority.value,
        'active': task.active,
        'created_at': task.created_at
    })

@tasks_bp.route('/', methods=['GET', 'OPTIONS'])
def list_tasks():
    if request.method == 'OPTIONS':
        return '', 200
    tasks = Task.query.all()
    return jsonify([
        {
            'tid': t.tid,
            'patient_id': t.patient_id,
            'caretaker_id': t.caretaker_id,
            'title': t.title,
            'description': t.description,
            'due_at': t.due_at,
            'status': t.status.value,
            'priority': t.priority.value,
            'active': t.active,
            'created_at': t.created_at
        } for t in tasks
    ])

@tasks_bp.route('/<int:tid>', methods=['PUT', 'OPTIONS'])
def update_task(tid):
    if request.method == 'OPTIONS':
        return '', 200
    task = Task.query.get(tid)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    data = request.get_json()
    for field in ['title', 'description', 'due_at', 'active']:
        if field in data:
            setattr(task, field, data[field])
    if 'status' in data:
        try:
            task.status = TaskStatus(data['status'])
        except Exception:
            pass
    if 'priority' in data:
        try:
            task.priority = Priority(data['priority'])
        except Exception:
            pass
    db.session.commit()
    return jsonify({'message': 'Task updated'})

@tasks_bp.route('/<int:tid>', methods=['DELETE', 'OPTIONS'])
def delete_task(tid):
    if request.method == 'OPTIONS':
        return '', 200
    task = Task.query.get(tid)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})
