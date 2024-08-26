from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from chat import setup_chat_routes, setup_chat_sockets
from webrtc import setup_webrtc_sockets

# Define log levels and color codes
DEBUG = 'DEBUG'
INFO = 'INFO'
WARNING = 'WARNING'
ERROR = 'ERROR'
CRITICAL = 'CRITICAL'

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

# Setup routes and sockets
setup_chat_routes(app, session_storage, log_message)
setup_chat_sockets(socketio, session_storage, log_message)
setup_webrtc_sockets(socketio)

if __name__ == '__main__':
    import os
    if os.getenv('TESTING', True):
        socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
    else:
        socketio.run(app, debug=True)