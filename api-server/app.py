from flask import Flask, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

# Route to generate a unique meeting link
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    # Generate a unique meeting ID
    meeting_id = str(uuid.uuid4())
    return jsonify({'meeting_id': meeting_id})

# when users want to join a meeting
@socketio.on('join')
def handle_join(data):
    meeting_id = data['meeting_id']
    join_room(meeting_id)
    emit('user_joined', {'message': f'User joined meeting {meeting_id}'}, room=meeting_id)

# when user sends SDP
@socketio.on('offer')
def handle_offer(data):
    meeting_id = data['meeting_id']
    emit('offer', data, room=meeting_id)

# when user receives SDP
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
