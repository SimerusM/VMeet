from flask import jsonify, request
from flask_socketio import emit
from utils.Debugger import Debugger

def setup_chat(app, socketio, session_storage, log_message, rate_limiter):
    @app.route('/api/chat_history/<meeting_id>', methods=['GET'])
    def get_chat_history(meeting_id):
        Debugger.log_message('DEBUG', f'{session_storage}')
        if meeting_id not in session_storage:
            return jsonify({'error': 'Meeting ID not found'}), 404
        return jsonify(session_storage[meeting_id]['chat_history'])

    @socketio.on('chat_message')
    def handle_chat_message(data):
        Debugger.log_message('DEBUG', f'{session_storage}')
        meeting_id = data['meeting_id']
        sender = data['sender']
        message = data['text']

        if meeting_id not in session_storage:
            log_message('ERROR', f'Meeting ID {meeting_id} not found', meeting_id)
            emit('error', {'message': 'Meeting ID not found'}, to=request.sid)
            return

        isRateLimited = rate_limiter.rateLimitChat(sender)
        Debugger.log_message(Debugger.DEBUG, f"isRateLimited: {isRateLimited}")
        if isRateLimited:
            Debugger.log_message(Debugger.DEBUG, "Rate limited")
            emit('chat_message', {'rate_limited': True}, to=request.sid)
            return
        
        Debugger.log_message(Debugger.DEBUG, "trace 1")
        session_storage[meeting_id]['chat_history'].append({'sender': sender, 'text': message})
        log_message('INFO', f'User {sender} sent: {message}', meeting_id)
        emit('chat_message', {'sender': sender, 'text': message}, room=meeting_id)
