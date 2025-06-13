import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="dashboard-content">
        <div className="user-info">
          <h2>User Information</h2>
          {currentUser && currentUser.email ? (
            <div>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role || 'user'}</p>
            </div>
          ) : (
            <p>No user information available</p>
          )}
        </div>
        
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-button"
              onClick={() => window.location.href = 'http://upload.localhost:3000'}
            >
              Go to Upload
            </button>
            <button 
              className="action-button"
              onClick={() => window.location.href = 'http://manager.localhost:3000'}
              disabled={!['manager', 'admin'].includes(currentUser?.role)}
            >
              Manager Dashboard
            </button>
            <button 
              className="action-button"
              onClick={() => window.location.href = 'http://admin.localhost:3000'}
              disabled={currentUser?.role !== 'admin'}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
