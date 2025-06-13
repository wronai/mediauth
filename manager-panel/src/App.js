import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import ManagerDashboard component
import ManagerDashboard from './components/ManagerDashboard';

// Use HTTP for development
const API_URL = process.env.REACT_APP_API_URL || 'http://api.localhost';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'manager' || parsedUser.role === 'admin') {
          setUser(parsedUser);
        } else {
          // Redirect to appropriate dashboard based on role
          if (parsedUser.role === 'admin') {
            window.location.href = 'http://admin.localhost:3000';
          } else {
            window.location.href = 'http://localhost:3000';
          }
          return;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = 'http://login.localhost:3000';
      return;
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'http://login.localhost:3000';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ManagerDashboard user={user} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
