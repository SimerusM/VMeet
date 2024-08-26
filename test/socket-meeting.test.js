import io from 'socket.io-client';
import * as chai from 'chai';

const { expect } = chai;

// Replace with your Flask-SocketIO server URL
const SERVER_URL = 'http://localhost:5000';
const CREATE_MEETING_URL = `${SERVER_URL}/api/create-meeting`;

describe('Socket.IO meeting tests', function() {
  this.timeout(2000);

  let meetingId;
  let socket1;
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
    socket1 = io(SERVER_URL);
    socket2 = io(SERVER_URL);

    // Wait for both clients to connect before continuing
    await Promise.all([
      new Promise((resolve) => socket1.on('connect', resolve)),
      new Promise((resolve) => socket2.on('connect', resolve))
    ]);
  });

  it('user1 joins meeting and handles user_joined event', function(done) {
    socket1.emit('join', { meeting_id: meetingId, username: 'User1' });

    socket1.on('user_joined', (data) => {
      expect(data).to.have.property('username');
      expect(data.username).to.equal('User1');
      expect(data.meeting_id).to.include(meetingId);
      done();
    });
  });

  it('multiple users should join the meeting and get session info', async function() {
    socket1.emit('join', { meeting_id: meetingId, username: 'User1' });
    socket2.emit('join', { meeting_id: meetingId, username: 'User2' });

    await Promise.all([
      new Promise((resolve) => socket1.on('user_joined', resolve)),
      new Promise((resolve) => socket2.on('user_joined', resolve))
    ]);

    console.log('Waiting for session info...');
    fetch(`${SERVER_URL}/api/session/${meetingId}`)
      .then((response) => response.json())
      .then((data) => {
        expect(data).to.have.property('host');
        expect(data.host).to.equal('User1');

        expect(data).to.have.property('users');
        expect(data.users).to.include('User1');
        expect(data.users).to.include('User2');

        expect(data).to.have.property('chat_history');
        resolve();
      });
  });

  it('should handle chat_message event', async function() {
    const testMessage = 'Hello, world!';

    socket1.emit('join', { meeting_id: meetingId, username: 'User1' });
    socket2.emit('join', { meeting_id: meetingId, username: 'User2' });
    
    await Promise.all([
      new Promise((resolve) => socket1.on('user_joined', resolve)),
      new Promise((resolve) => socket2.on('user_joined', resolve))
    ])

    // Emit a chat message from the first client
    socket1.emit('chat_message', { meeting_id: meetingId, sender: 'User1', text: testMessage });

    // Listen for chat_message event on the second client
    await new Promise((resolve) => 
      socket2.on('chat_message', (data) => {
        expect(data).to.have.property('sender', 'User1');
        expect(data).to.have.property('text', testMessage);
        resolve();
      })
    );
  });

  afterEach(function() {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  });
});
