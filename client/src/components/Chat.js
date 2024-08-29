// src/components/Chat.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Button from './Button';
import ChatHandler from '../services/chatHandler';
import ChatInput from './ChatInput';


const Chat = ({ meeting_id, username, socket }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatHandler = useRef(null);

  const initializeChat = () => {
    if (!username) {
      toast.error('Please enter a username before joining a meeting.');
      return;
    }

    const errorHandler = (error) => {
      console.error(error);
      toast.error(error.message);
    }

    // Assuming ChatHandler is a utility to handle the chat logic
    chatHandler.current = new ChatHandler(meeting_id, username, socket, setChatHistory, errorHandler);
    chatHandler.current.initialize();
  };

  useEffect(() => {
    initializeChat();
  }, [meeting_id, username, socket]);

  const handleSendMessage = useCallback((message) => {
    if (!message.trim()) {
      toast.error('Please enter a message before sending.');
      return;
    }
    chatHandler.current.sendMessage(message);
    setChatHistory(prevHistory => [...prevHistory, { sender: username, text: message }]);
  }, [username]);

  const getProfilePicture = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
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
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

Chat.propTypes = {
  meeting_id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
};

export default Chat;
