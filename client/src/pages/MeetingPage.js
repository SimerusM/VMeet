import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatHandler from '../services/chatHandler';
import RTCHandler from '../services/rtcHandler';

import Button from '../components/Button';
import toast, { Toaster } from 'react-hot-toast';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MeetingPage = () => {
  const { meeting_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef();
  const username = location.state?.username;

  const rtcHandler = useRef(null);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const chatHandler = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!username) {
      toast.error('Please enter a username before joining a meeting.');
      navigate('/');
      return;
    }

    console.log(`Joining meeting with ID: ${meeting_id}`);
    toast.success(`Joining the meeting`);

    const newSocket = io(apiUrl);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join', { meeting_id: meeting_id, username: username });
    });

    chatHandler.current = new ChatHandler(meeting_id, username, socketRef.current, setChatHistory);
    chatHandler.current.initialize();
    const handlePeerUpdate = (update) => {
      setPeers(prevPeers => ({...prevPeers, ...update}));
    }
    rtcHandler.current = new RTCHandler(meeting_id, username, socketRef.current, handlePeerUpdate);
    rtcHandler.current.initialize();

    return () => {
      rtcHandler.current.cleanup();
      socketRef.current.disconnect();
    }
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message before sending.');
      return;
    }
    chatHandler.current.sendMessage(message);
    setMessage('');
  };

  const getProfilePicture = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  if (!username || !rtcHandler.current) {
    // wait for username and rtcHandler
    return null;
  }

  const VideoElement = React.memo(({ stream, muted, peerName }) => {
    const videoRef = useRef();

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div>
        <video ref={videoRef} autoPlay playsInline muted={muted} />
        <p>{peerName}</p>
      </div>
    );
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl">Meeting: {meeting_id}</h1>
        <p>Welcome, {username}!</p>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4">
          <VideoElement stream={rtcHandler.current.localStream} muted={true} peerName="You" />
          {Object.entries(peers).map(([peerUsername, peer]) => (
            <VideoElement 
              key={peerUsername} 
              stream={peer.stream} 
              muted={false} 
              peerName={peerUsername}
            />
          ))}
        </div>
        <div className="w-1/4 bg-white p-4 flex flex-col">
          <h2 className="text-xl mb-4">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className="mb-2 flex items-center">
                <img 
                  src={getProfilePicture(msg.sender)} 
                  alt={`${msg.sender}'s avatar`} 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-2 py-1 border rounded-l"
              placeholder="Type a message..."
            />
            <Button type="submit" className="rounded-l-none">Send</Button>
          </form>
        </div>
      </main>
      <footer className="bg-gray-200 p-4 flex justify-center space-x-4">
        <Button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</Button>
        <Button onClick={toggleVideo}>{isVideoOff ? 'Turn On Video' : 'Turn Off Video'}</Button>
        <Button className="bg-red-500 hover:bg-red-600" onClick={() => navigate('/')}>Leave Meeting</Button>
      </footer>
    </div>
  );
};

export default MeetingPage;