from flask import Flask, jsonify, request

app = Flask(__name__)

# A simple route for the home page
@app.route('/')
def home():
    return "Welcome to the Flask App!"

# A route that returns JSON data
@app.route('/api/data', methods=['GET'])
def get_data():
    sample_data = {
        "message": "Hello, this is your Flask API!",
        "status": "success"
    }
    return jsonify(sample_data)

# A route that accepts POST requests with JSON data
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    return jsonify({"received_data": data, "status": "data received"}), 201

if __name__ == '__main__':
    app.run(debug=True)
