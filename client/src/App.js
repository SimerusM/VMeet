import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import MeetingPage from './pages/MeetingPage';

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