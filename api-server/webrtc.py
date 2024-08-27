from flask_socketio import emit

def setup_webrtc(app, socketio, session_storage, log_message):
    @socketio.on('offer')
    def handle_offer(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        emit('offer', data, room=to_sid)

    @socketio.on('answer')
    def handle_answer(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        emit('answer', data, room=to_sid)

    @socketio.on('ice_candidate')
    def handle_ice_candidate(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        emit('ice_candidate', data, room=to_sid)