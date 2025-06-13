import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerDashboard = ({ user, onLogout }) => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://api.localhost';

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploads(response.data);
      } catch (err) {
        setError('Failed to fetch uploads');
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploads(uploads.map(upload => 
        upload._id === id ? { ...upload, status: 'approved' } : upload
      ));
      setMessage('Upload approved successfully');
    } catch (err) {
      setError('Failed to approve upload');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploads(uploads.filter(upload => upload._id !== id));
      setMessage('Upload rejected successfully');
    } catch (err) {
      setError('Failed to reject upload');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>👨‍💼 Manager Dashboard</h1>
        <div>
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="uploads-list">
        <h2>Pending Approvals</h2>
        {uploads.length === 0 ? (
          <p>No pending uploads</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Uploader</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload._id}>
                  <td>{upload.filename}</td>
                  <td>{upload.uploaderEmail}</td>
                  <td>{upload.description}</td>
                  <td>{new Date(upload.uploadedAt).toLocaleString()}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleApprove(upload._id)}
                      disabled={upload.status === 'approved'}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(upload._id)}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
