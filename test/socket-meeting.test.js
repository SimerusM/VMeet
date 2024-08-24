import io from 'socket.io-client';
import axios from 'axios';
import * as chai from 'chai';

const { expect } = chai;

// Replace with your Flask-SocketIO server URL
const SERVER_URL = 'http://localhost:5000';
const CREATE_MEETING_URL = `${SERVER_URL}/api/create-meeting`;

describe('Socket.IO Integration Tests', function() {
  let meetingId;
  let socket;

  before(async function() {
    // Create a meeting
    const response = await axios.post(CREATE_MEETING_URL);
    meetingId = response.data.meeting_id;
    expect(meetingId).to.be.a('string'); // Check that meetingId is a string

    // Connect to the server
    socket = io(SERVER_URL);
  });

  it('should join the meeting and handle user_joined event', function(done) {
    socket.emit('join', { meeting_id: meetingId });

    socket.on('user_joined', (data) => {
      expect(data).to.have.property('message');
      expect(data.message).to.include(meetingId);
      done(); // Signal that the test is complete
    });
  });

  it('should handle offer event', function(done) {
    socket.emit('offer', { meeting_id: meetingId, sdp: 'offer-sdp-data' });

    socket.on('offer', (data) => {
      expect(data).to.have.property('sdp', 'offer-sdp-data');
      done();
    });
  });

  it('should handle answer event', function(done) {
    socket.emit('answer', { meeting_id: meetingId, sdp: 'answer-sdp-data' });

    socket.on('answer', (data) => {
      expect(data).to.have.property('sdp', 'answer-sdp-data');
      done();
    });
  });

  it('should handle ice_candidate event', function(done) {
    socket.emit('ice_candidate', { meeting_id: meetingId, candidate: 'ice-candidate-data' });

    socket.on('ice_candidate', (data) => {
      expect(data).to.have.property('candidate', 'ice-candidate-data');
      done();
    });
  });

  after(function() {
    socket.disconnect();
  });
});
