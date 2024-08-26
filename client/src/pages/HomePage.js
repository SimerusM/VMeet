import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components";
import toast, { Toaster } from 'react-hot-toast';

const HomePage = () => {
  const [meetCode, setMeetCode] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoinMeet = () => {
    if (!username.trim()) {
      toast.error('Please enter a username before joining a meeting.');
      return;
    }
    if (meetCode.trim()) {
      navigate(`/meet/${meetCode}`, { state: { username } });
    } else {
      toast.error('Please enter a meeting code.');
    }
  };

  const handleCreateMeet = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username before creating a meeting.');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const generatedCode = (await response.json()).meeting_id;
      navigate(`/meet/${generatedCode}`, { state: { username } });
    } catch (error) {
      toast.error('Failed to create meeting. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-8">Welcome to VMeet</h1>
      <div className="w-full max-w-md">
        <Input
          type="text"
          placeholder="Enter your username (required)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4"
        />
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter meeting code"
            value={meetCode}
            onChange={(e) => setMeetCode(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleJoinMeet}>Join</Button>
        </div>
        <Button onClick={handleCreateMeet} className="w-full">Create New Meeting</Button>
      </div>
    </div>
  );
};

export default HomePage;