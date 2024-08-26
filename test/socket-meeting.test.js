import io from 'socket.io-client';
import * as chai from 'chai';

const { expect } = chai;

// Replace with your Flask-SocketIO server URL
const SERVER_URL = 'http://localhost:5000';
const CREATE_MEETING_URL = `${SERVER_URL}/api/create-meeting`;

describe('Socket.IO meeting tests', function() {
  let meetingId;
  let socket;
  let socket2;

  beforeEach(async function() {
    // Create a meeting
    const response = await fetch(CREATE_MEETING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'User1' }),
    });
    const data = await response.json();
    meetingId = data.meeting_id;
    expect(meetingId).to.be.a('string'); // Check that meetingId is a string
  
    // Connect both clients to the server
    socket = io(SERVER_URL);
    socket2 = io(SERVER_URL);

    // Wait for both clients to connect before continuing
    await Promise.all([
      new Promise((resolve) => socket.on('connect', resolve)),
      new Promise((resolve) => socket2.on('connect', resolve))
    ]);
  });

  it('should join the meeting and handle user_joined event', function(done) {
    socket.emit('join', { meeting_id: meetingId, username: 'User2' });

    socket.on('user_joined', (data) => {
      expect(data).to.have.property('username');
      expect(data.username).to.equal('User2');
      expect(data.meeting_id).to.include(meetingId);
      done();
    });
  });

  it('should handle chat_message event', function(done) {
    const testMessage = 'Hello, world!';

    // socket.emit('join', { meeting_id: meetingId, username: 'User1' });
    socket2.emit('join', { meeting_id: meetingId, username: 'User2' });

    // Emit a chat message from the first client
    socket.emit('chat_message', { meeting_id: meetingId, sender: 'User1', text: testMessage });

    // Listen for chat_message event on the second client
    socket2.on('chat_message', (data) => {
      expect(data).to.have.property('sender', 'User1');
      expect(data).to.have.property('text', testMessage);
      done();
    });
  });

  afterEach(function() {
    if (socket) socket.disconnect();
    if (socket2) socket2.disconnect();
  });
});
