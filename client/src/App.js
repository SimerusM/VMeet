import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const HomePage = () => {
  const [meetCode, setMeetCode] = useState('');
  const navigate = useNavigate();

  const handleJoinMeet = () => {
    if (meetCode.trim()) {
      navigate(`/meet/${meetCode}`);
    }
  };

  const handleCreateMeet = async () => {
    const response = await fetch('http://127.0.0.1:5000/api/create-meeting', {
      method: 'POST',
    });
    const generatedCode = (await response.json()).meeting_id;
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

const MeetingPage = () => {
  return <div>Meeting Page</div>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meet/:id" element={<MeetingPage />} />
      </Routes>
    </Router>
  );
};

export default App;