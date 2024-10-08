import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import MainChat from './pages/MainChat';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mainchat" element={<MainChat />} />
        <Route path="/chatroom/:id" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
