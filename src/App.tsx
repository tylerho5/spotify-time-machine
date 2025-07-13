import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Callback from './pages/Callback';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <div className="gradient-bg min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;
