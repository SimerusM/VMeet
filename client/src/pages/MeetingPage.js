import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const SERVER_URL = 'http://127.0.0.1:5000';

const MeetingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!username) {
      toast.error('Please enter a username before joining a meeting.');
      navigate('/');
      return;
    }

    console.log(`Joining meeting with ID: ${id}`);
    
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join', { meeting_id: id, username });
    });

    newSocket.on('chat_message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => newSocket.close();
  }, [id, username, navigate]);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageObj = { text: newMessage, sender: username };
      if (socket) {
        socket.emit('chat_message', { meeting_id: id, ...messageObj });
      }
      setNewMessage('');
    }
  };

  const getProfilePicture = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  if (!username) {
    return null; // prevent flickering while redirecting
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl">Meeting: {id}</h1>
        <p>Welcome, {username}!</p>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4">
          <div className="bg-black h-3/4 mb-4 flex items-center justify-center text-white">
            {isVideoOff ? 'Video Off' : 'Your Video Stream'}
          </div>
          <div className="bg-gray-300 h-1/4 flex items-center justify-center">
            Participant Videos
          </div>
        </div>
        <div className="w-1/4 bg-white p-4 flex flex-col">
          <h2 className="text-xl mb-4">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
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
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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