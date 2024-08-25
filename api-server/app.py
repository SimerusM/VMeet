from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for chat messages
chat_storage = {}

# Route to generate a unique meeting link
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    # Generate a unique meeting ID
    meeting_id = str(uuid.uuid4())
    chat_storage[meeting_id] = []  # Initialize chat history for this meeting
    return jsonify({'meeting_id': meeting_id})

# When users want to join a meeting
@socketio.on('join')
def handle_join(data):
    meeting_id = data['meeting_id']
    username = data['username']
    join_room(meeting_id)
    print(f'User {username} joined meeting {meeting_id}')
    emit('user_joined', {'username': username, 'meeting_id': meeting_id}, room=meeting_id)

# Handle chat messages
@socketio.on('chat_message')
def handle_chat_message(data):
    meeting_id = data['meeting_id']
    sender = data['sender']
    message = data['text']

    # Save the chat message to the dictionary
    if meeting_id in chat_storage:
        chat_storage[meeting_id].append({'sender': sender, 'text': message})
    else:
        chat_storage[meeting_id] = [{'sender': sender, 'text': message}]

    print(f'Chat message in meeting {meeting_id} from {sender}: {message}')
    emit('chat_message', {'sender': sender, 'text': message}, room=meeting_id)

# Endpoint to retrieve chat history
@app.route('/api/chat_history/<meeting_id>', methods=['GET'])
def get_chat_history(meeting_id):
    if meeting_id in chat_storage:
        return jsonify(chat_storage[meeting_id])
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
