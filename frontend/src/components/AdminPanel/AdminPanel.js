import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://api.localhost';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/users`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User created successfully');
      setNewUser({ email: '', name: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API_URL}/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>👑 Admin Panel</h1>
        <div>
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="admin-section">
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser} className="user-form">
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </div>

      <div className="admin-section">
        <h2>User Management</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem._id}>
                <td>{userItem.name}</td>
                <td>{userItem.email}</td>
                <td>
                  <select
                    value={userItem.role}
                    onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                    disabled={userItem._id === user._id}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(userItem._id)}
                    disabled={userItem._id === user._id}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
