from flask import Blueprint, request, jsonify
import google.genai as genai

chat_bp = Blueprint('chat', __name__)

# Store chat sessions per user (or globally for now)
chat_sessions = {}
clients = {}
SESSION_ID = "default"

@chat_bp.route('/gemini', methods=['POST', 'OPTIONS'])
def chat_gemini():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    user_message = data.get('message')
    clear_history = data.get('clearHistory', False)
    session_id = data.get('sessionId', SESSION_ID)
    
    try:
        if clear_history:
            if session_id in chat_sessions:
                del chat_sessions[session_id]
            if session_id in clients:
                del clients[session_id]
            return jsonify({'reply': 'Chat history cleared'})
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get or create client and chat session
        if session_id not in clients:
            clients[session_id] = genai.Client()
        
        if session_id not in chat_sessions:
            chat_sessions[session_id] = clients[session_id].chats.create(model="gemini-2.5-flash")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        response = chat.send_message(user_message)
        
        return jsonify({'reply': response.text})
    except Exception as e:
        print(f"Chat error: {e}")
        # Clear the session on error so it can be recreated
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        if session_id in clients:
            del clients[session_id]
        return jsonify({'error': str(e)}), 500
