import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

// Join a room with a specific meeting ID
socket.emit('join', { 'username': 'teet', meeting_id: 'e45f73db-9973-4acd-9467-c48f56b26804' });

// Emit the SDP offer immediately
socket.emit('offer', { meeting_id: 'e45f73db-9973-4acd-9467-c48f56b26804', sdp: '...' });

// Simulate receiving the offer and sending back an SDP answer after 1 second
socket.emit('answer', { meeting_id: 'e45f73db-9973-4acd-9467-c48f56b26804', sdp: 'v=0\r\no=- 25678 753849 IN IP4 192.0.2.2\r\ns=-\r\nc=IN IP4 192.0.2.2\r\nt=0 0\r\na=recvonly\r\nm=video 49170 RTP/AVP 98\r\na=rtpmap:98 H264/90000\r\n' });

// Simulate sending ICE candidates after 2 seconds
socket.emit('ice_candidate', { meeting_id: 'e45f73db-9973-4acd-9467-c48f56b2', candidate: 'candidate:842163049 1 udp 1677729535 192.0.2.1 3478 typ srflx raddr 192.0.2.1 rport 3478' });

// Listen for events
socket.on('offer', (data) => console.log('Received offer:', data));
socket.on('answer', (data) => console.log('Received answer:', data));
socket.on('ice_candidate', (data) => console.log('Received ICE candidate:', data));
