from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from chat import setup_chat
from webrtc import setup_webrtc
import uuid
from utils.Debugger import Debugger

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for each session
session_storage = {}

# Setup routes and sockets
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    meeting_id = str(uuid.uuid4())
    data = request.get_json()
    username = data['username']

    if username == '':
        return jsonify({'error': 'Username cannot be empty'}), 400
    if meeting_id in session_storage:
        return jsonify({'error': 'Meeting ID already exists, please try again'}), 400

    session_storage[meeting_id] = {
        'host': username,
        'users': {}, # {username: sid}
        'chat_history': [] # [{sender: username, text: message}]
    }
    Debugger.log_message('INFO', f'User {username} created a new meeting', meeting_id)
    return jsonify({'meeting_id': meeting_id})

@app.route('/api/session/<meeting_id>', methods=['GET'])
def get_session(meeting_id):
    if meeting_id not in session_storage:
        return jsonify({'error': 'Meeting ID not found'}), 404
    return jsonify(session_storage[meeting_id])

@app.route('/api/users/<meeting_id>', methods=['GET'])
def get_users(meeting_id):
    if meeting_id not in session_storage:
        return jsonify({'error': 'Meeting ID not found'}), 404
    return jsonify(list(session_storage[meeting_id]['users'].keys()))

@socketio.on('join')
def handle_join(data):
    if 'username' not in data or 'meeting_id' not in data:
        Debugger.log_message('ERROR', f'Join request missing username or meeting ID: {data}')
        emit('error', {'message': 'Missing username or meeting ID'}, to=request.sid)
        return

    meeting_id = data['meeting_id']
    username = data['username']
    join_room(meeting_id)
    session = session_storage[meeting_id]
    session['users'][username] = request.sid

    Debugger.log_message('INFO', f'User {username} joined the meeting', meeting_id)
    emit('user_joined', {'username': username, 'meeting_id': meeting_id}, room=meeting_id)

@socketio.on('disconnect')
def handle_disconnect():
    to_delete = []
    for meeting_id, session in session_storage.items():
        if request.sid in session['users'].values():
            username = [username for username, sid in session['users'].items() if sid == request.sid][0]
            del session['users'][username]
            if len(session['users']) == 0:
                to_delete.append(meeting_id)
            Debugger.log_message('INFO', f'User {request.sid} left the meeting', meeting_id)
            emit('user_left', {'meeting_id': meeting_id, 'username': username}, room=meeting_id)

    for meeting_id in to_delete:
        del session_storage[meeting_id]

setup_chat(app, socketio, session_storage, Debugger.log_message)
setup_webrtc(app, socketio, session_storage, Debugger.log_message)

if __name__ == '__main__':
    import os
    if os.getenv('TESTING', True):
        socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
    else:
        socketio.run(app, debug=True)