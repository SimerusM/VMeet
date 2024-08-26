import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import MeetingPage from './pages/MeetingPage';
import SignalingTestPage from './pages/SignalTestPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meet/:meeting_id" element={<MeetingPage />} />
        <Route path="/test/:meeting_id" element={<SignalingTestPage />} />
      </Routes>
    </Router>
  );
};

export default App;