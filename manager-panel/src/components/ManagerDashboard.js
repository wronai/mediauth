import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Fallback to localStorage if props are not provided (for development)
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'http://login.localhost:3000';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Manager Dashboard</h1>
        {currentUser && currentUser.email ? (
          <div>
            <p>Welcome, {currentUser.email}!</p>
            <p>Role: {currentUser.role}</p>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
        <button onClick={handleLogout} style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#61dafb',
          color: '#282c34',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Logout
        </button>
      </header>
    </div>
  );
};

export default ManagerDashboard;
