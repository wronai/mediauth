import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import AdminPanel component
import AdminPanel from './components/AdminPanel/AdminPanel';

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
        if (parsedUser.role === 'admin') {
          setUser(parsedUser);
        } else {
          // Redirect to appropriate dashboard based on role
          window.location.href = `http://${parsedUser.role}.localhost:3000`;
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-app">
      <AdminPanel user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
