import React, { useRef } from 'react';
import Button from '../components/Button';
import PropTypes from 'prop-types';

const ChatInput = ({ onSend }) => {
  const inputRef = useRef();

  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = inputRef.current.value.trim();
    if (message) {
      onSend(message);
      inputRef.current.value = ''; // Clear the input after sending
    } else {
      console.error('Message cannot be empty');
    }
  };

  return (
    <div className="flex">
      <input
        ref={inputRef}
        type="text"
        className="flex-1 px-2 py-1 border rounded-l"
        placeholder="Type a message..."
      />
      <Button onClick={handleSendMessage} className="rounded-l-none">Send</Button>
    </div>
  );
};

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
};

export default ChatInput;
