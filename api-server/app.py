from flask import Flask, jsonify, render_template, request
import uuid

app = Flask(__name__)

# Route to generate a unique meeting link
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    # Generate a unique meeting ID
    meeting_id = str(uuid.uuid4())
    
    return jsonify({'meeting_id': meeting_id})

if __name__ == '__main__':
    app.run(debug=True)
