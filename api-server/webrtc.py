from flask_socketio import emit

def setup_webrtc_sockets(socketio):
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