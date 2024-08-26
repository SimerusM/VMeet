from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import uuid

# Define log levels
DEBUG = 'DEBUG'
INFO = 'INFO'
WARNING = 'WARNING'
ERROR = 'ERROR'
CRITICAL = 'CRITICAL'

# Define color codes
DEBUG_COLOR = '\033[94m'
INFO_COLOR = '\033[92m'
WARNING_COLOR = '\033[93m'
ERROR_COLOR = '\033[91m'
CRITICAL_COLOR = '\033[41m'
RESET_COLOR = '\033[0m'

def log_message(level, message, meeting=''):
    color_map = {
        DEBUG: DEBUG_COLOR,
        INFO: INFO_COLOR,
        WARNING: WARNING_COLOR,
        ERROR: ERROR_COLOR,
        CRITICAL: CRITICAL_COLOR
    }
    
    color = color_map.get(level, RESET_COLOR)
    meeting = f"[{meeting}] " if meeting else ''
    print(f"{color}{level} {meeting}- {message}{RESET_COLOR}")

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for each session
session_storage = {}

# Route to generate a unique meeting link
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    # Generate a unique meeting ID
    meeting_id = str(uuid.uuid4())
    data = request.get_json()
    username = data['username']
    session_storage[meeting_id] = {
        'host': username,
        'users': [username],
        'chat_history': []
    }
    log_message(INFO, f'User {username} created a new meeting', meeting_id)
    return jsonify({'meeting_id': meeting_id})

# When users want to join a meeting
@socketio.on('join')
def handle_join(data):
    meeting_id = data['meeting_id']
    username = data['username']

    if meeting_id not in session_storage:
        emit('error', 'Invalid meeting ID', room=meeting_id)
        return
    session = session_storage[meeting_id]
    if username in session_storage[meeting_id]['users']:
        emit('error', 'User already joined', room=meeting_id)
        return
    session['users'].append(username)

    join_room(meeting_id)
    log_message(INFO, f'User {username} joined the meeting', meeting_id)
    emit('user_joined', {'username': username, 'meeting_id': meeting_id}, room=meeting_id)

# Handle chat messages
@socketio.on('chat_message')
def handle_chat_message(data):
    meeting_id = data['meeting_id']
    sender = data['sender']
    message = data['text']

    # Save the chat message to the dictionary
    if meeting_id not in session_storage:
        return

    session_storage[meeting_id]['chat_history'].append({'sender': sender, 'text': message})

    log_message(INFO, f'User {sender} sent: {message}', meeting_id)
    emit('chat_message', {'sender': sender, 'text': message}, room=meeting_id)

# Endpoint to retrieve chat history
@app.route('/api/chat_history/<meeting_id>', methods=['GET'])
def get_chat_history(meeting_id):
    if meeting_id in chat_storage:
        return jsonify(session_storage[meeting_id]['chat_history'])
    else:
        return jsonify({'error': 'Meeting ID not found'}), 404

# Handle SDP (Session Description Protocol) messages
@socketio.on('offer')
def handle_offer(data):
    meeting_id = data['meeting_id']
    emit('offer', data, room=meeting_id)

@socketio.on('answer')
def handle_answer(data):
    meeting_id = data['meeting_id']
    emit('answer', data, room=meeting_id)

@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    meeting_id = data['meeting_id']
    emit('ice_candidate', data, room=meeting_id)

if __name__ == '__main__':
    socketio.run(app, debug=True)
