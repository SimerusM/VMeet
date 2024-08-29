import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import RTCHandler from '../services/rtcHandler';
import Chat from '../components/Chat';

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

  const initializeMeeting = () => {
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

    const errorHandler = (error) => {
      console.error(error);
      navigate('/');
      toast.error(error.message);
    };

    rtcHandler.current = new RTCHandler(meeting_id, username, socketRef.current, setPeers, errorHandler);
    rtcHandler.current.initialize();
  };

  useEffect(() => {
    initializeMeeting();

    return () => {
      rtcHandler.current.cleanup();
      socketRef.current.disconnect();
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(prevState => {
      const newMutedState = !prevState;
      if (rtcHandler.current && rtcHandler.current.localStream) {
        rtcHandler.current.localStream.getAudioTracks().forEach(track => {
          track.enabled = !newMutedState;
        });
      }
      return newMutedState;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(prevState => {
      const newVideoState = !prevState;
      if (rtcHandler.current && rtcHandler.current.localStream) {
        rtcHandler.current.localStream.getVideoTracks().forEach(track => {
          track.enabled = !newVideoState;
        });
      }
      return newVideoState;
    });
  };

  const VideoElement = React.memo(({ stream, muted, peerName }) => {
    const videoRef = useRef();

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted={muted} className="video-element" />
        <p className="video-username">{peerName}</p>
      </div>
    );
  });

  if (!username || !rtcHandler.current) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl">Meeting: {meeting_id}</h1>
        <p>Welcome, {username}!</p>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {rtcHandler.current.localStream && (
            <VideoElement stream={rtcHandler.current.localStream} muted={true} peerName="You" />
          )}
          {Object.entries(peers).map(([peerUsername, peer]) => (
            peerUsername !== username && (
              <VideoElement
                key={peerUsername}
                stream={peer.stream}
                muted={false}
                peerName={peerUsername}
              />
            )
          ))}
        </div>
        <Chat meeting_id={meeting_id} username={username} socket={socketRef.current} />
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
