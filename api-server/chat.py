from flask import jsonify, request
from flask_socketio import emit, join_room
import uuid

def setup_chat_routes(app, session_storage, log_message):
    @app.route('/api/create-meeting', methods=['POST'])
    def create_meeting():
        meeting_id = str(uuid.uuid4())
        data = request.get_json()
        username = data['username']
        session_storage[meeting_id] = {
            'host': username,
            'users': [],
            'chat_history': []
        }
        log_message('INFO', f'User {username} created a new meeting', meeting_id)
        return jsonify({'meeting_id': meeting_id})

    @app.route('/api/chat_history/<meeting_id>', methods=['GET'])
    def get_chat_history(meeting_id):
        if meeting_id in session_storage:
            return jsonify(session_storage[meeting_id]['chat_history'])
        else:
            return jsonify({'error': 'Meeting ID not found'}), 404

    @app.route('/api/session/<meeting_id>', methods=['GET'])
    def get_users(meeting_id):
        if meeting_id in session_storage:
            return jsonify(session_storage[meeting_id])
        else:
            return jsonify({'error': 'Meeting ID not found'}), 404

def setup_chat_sockets(socketio, session_storage, log_message):
    @socketio.on('join')
    def handle_join(data):
        if 'username' not in data or 'meeting_id' not in data:
            log_message('ERROR', f'Join request missing username or meeting ID: {data}')
            return
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
        log_message('INFO', f'User {username} joined the meeting', meeting_id)
        emit('user_joined', {'username': username, 'meeting_id': meeting_id}, room=meeting_id)

    @socketio.on('chat_message')
    def handle_chat_message(data):
        meeting_id = data['meeting_id']
        sender = data['sender']
        message = data['text']
        if meeting_id not in session_storage:
            return
        session_storage[meeting_id]['chat_history'].append({'sender': sender, 'text': message})
        log_message('INFO', f'User {sender} sent: {message}', meeting_id)
        emit('chat_message', {'sender': sender, 'text': message}, room=meeting_id)