import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components";

const HomePage = () => {
  const [meetCode, setMeetCode] = useState('');
  const navigate = useNavigate();

  const handleJoinMeet = () => {
    if (meetCode.trim()) {
      navigate(`/meet/${meetCode}`);
    }
  };

  const handleCreateMeet = async () => {
    const generatedCode = (await fetch('http://127.0.0.1:5000/api/create-meeting')).meeting_id;
    console.log(generatedCode);
    navigate(`/meet/${generatedCode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to VMeet</h1>
      <div className="w-full max-w-md">
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