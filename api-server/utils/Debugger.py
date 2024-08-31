from flask import request

"""
Usage Guide:
------------
Debugger.<method_name>(<parameters>)

Examples:
- Debugger.log_message(Debugger.INFO, "User logged in")
- Debugger.log_transport()

Available methods:
- log_message(level: str, message: str, meeting: str = '')
- log_transport()
"""
class Debugger:
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

    @staticmethod
    def log_message(level: str, message: str, meeting=''):
        '''
        Dev Function to standardize different types of logs
        '''
        color_map = {
            Debugger.DEBUG: Debugger.DEBUG_COLOR,
            Debugger.INFO: Debugger.INFO_COLOR,
            Debugger.WARNING: Debugger.WARNING_COLOR,
            Debugger.ERROR: Debugger.ERROR_COLOR,
            Debugger.CRITICAL: Debugger.CRITICAL_COLOR
        }
        
        color = color_map.get(level, Debugger.RESET_COLOR)
        meeting = f"[{meeting}] " if meeting else ''
        print(f"{color}{level} {meeting}- {message}{Debugger.RESET_COLOR}", flush=True)
    
    @staticmethod
    def log_transport():
        '''
        Dev Function to log the transport method used in the connections
        '''
        transport = request.args.get('transport', 'unknown')
        Debugger.log_message('DEBUG', f'Connection transport: {transport}')

