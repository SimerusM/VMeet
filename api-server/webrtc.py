from flask import request
from flask_socketio import emit

class DebugTools:
    @staticmethod
    def log_transport(self):
        '''
        Dev Function to log the transport method used in the WebSocket connection.
        '''
        transport = request.args.get('transport', 'unknown')
        self.log_message('DEBUG', f'Connection transport: {transport}')


def setup_webrtc(app, socketio, session_storage, log_message):

    @socketio.on('offer')
    def handle_offer(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        log_message('INFO', f'User {data["from"]} sent an offer', data['meeting_id'])
        emit('offer', data, room=to_sid, skip_sid=request.sid)

    @socketio.on('answer')
    def handle_answer(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        log_message('INFO', f'User {data["from"]} sent an answer', data['meeting_id'])
        emit('answer', data, room=to_sid, skip_sid=request.sid)

    @socketio.on('ice_candidate')
    def handle_ice_candidate(data):
        to_sid = session_storage[data['meeting_id']]['users'][data['to']]
        emit('ice_candidate', data, room=to_sid, skip_sid=request.sid)