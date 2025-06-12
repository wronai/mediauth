import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://api.localhost';

// ============ PUBLIC UPLOAD PAGE ============
function PublicUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !uploaderEmail) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('uploaderEmail', uploaderEmail);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData);
      setResult({ success: true, message: response.data.message, uploadId: response.data.uploadId });
      setFile(null); setDescription(''); setUploaderEmail('');
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h1>🚀 File Upload System</h1>
      <p>Upload your files for approval. No account required!</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="email"
          placeholder="Your email address"
          value={uploaderEmail}
          onChange={(e) => setUploaderEmail(e.target.value)}
          required
        />

        <div className="file-input-wrapper">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          {file && <span className="file-name">{file.name}</span>}
        </div>

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          <p>{result.message}</p>
          {result.success && <p><strong>Upload ID:</strong> {result.uploadId}</p>}
        </div>
      )}
    </div>
  );
}

// ============ LOGIN PAGE ============
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>🔐 Login</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <div className="result error">{error}</div>}

      <div className="login-help">
        <h3>Demo Credentials:</h3>
        <p><strong>Admin:</strong> admin@company.com / admin123</p>
        <p><strong>Manager:</strong> manager@company.com / manager123</p>
      </div>
    </div>
  );
}

// ============ MANAGER DASHBOARD ============
function ManagerDashboard({ user, onLogout }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUploads = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/manager/pending`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      setUploads(response.data.uploads);
    } catch (error) {
      console.error('Failed to load uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUpload = async (id) => {
    try {
      await axios.post(`${API_URL}/api/manager/approve/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      loadUploads();
    } catch (error) {
      alert('Failed to approve upload');
    }
  };

  const rejectUpload = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await axios.post(`${API_URL}/api/manager/reject/${id}`, { reason }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      loadUploads();
    } catch (error) {
      alert('Failed to reject upload');
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <header className="dashboard-header">
        <h1>📋 Manager Dashboard</h1>
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{uploads.length}</div>
          <div className="stat-label">Pending Uploads</div>
        </div>
      </div>

      <div className="uploads-grid">
        {uploads.length === 0 ? (
          <div className="empty-state">
            <h3>No pending uploads</h3>
            <p>All caught up!</p>
          </div>
        ) : (
          uploads.map(upload => (
            <div key={upload.id} className="upload-card">
              <h3>{upload.original_name}</h3>
              <p><strong>From:</strong> {upload.uploader_email}</p>
              <p><strong>Size:</strong> {Math.round(upload.size / 1024)} KB</p>
              <p><strong>Uploaded:</strong> {new Date(upload.uploaded_at).toLocaleDateString()}</p>
              {upload.description && <p><strong>Description:</strong> {upload.description}</p>}

              <div className="upload-actions">
                <button onClick={() => approveUpload(upload.id)} className="approve-btn">
                  ✅ Approve
                </button>
                <button onClick={() => rejectUpload(upload.id)} className="reject-btn">
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ ADMIN PANEL ============
function AdminPanel({ user, onLogout }) {
  const [config, setConfig] = useState({
    smtp_host: '', smtp_port: 587, smtp_username: '', smtp_password: '',
    from_email: '', from_name: ''
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const loadConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/config`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      setConfig({ ...config, ...response.data });
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API_URL}/api/admin/config`, config, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      setResult({ success: true, message: 'Configuration saved successfully!' });
    } catch (error) {
      setResult({ success: false, message: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTesting(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin/test-email`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      setResult({ success: response.data.success, message: response.data.message || response.data.error });
    } catch (error) {
      setResult({ success: false, message: 'Test email failed' });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div className="page">
      <header className="dashboard-header">
        <h1>⚙️ Admin Panel</h1>
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="config-section">
        <h2>📧 Email Configuration</h2>

        <form onSubmit={saveConfig} className="config-form">
          <div className="form-grid">
            <input
              type="text"
              placeholder="SMTP Host (e.g., smtp.gmail.com)"
              value={config.smtp_host}
              onChange={(e) => setConfig({...config, smtp_host: e.target.value})}
            />
            <input
              type="number"
              placeholder="SMTP Port (587)"
              value={config.smtp_port}
              onChange={(e) => setConfig({...config, smtp_port: parseInt(e.target.value)})}
            />
            <input
              type="text"
              placeholder="SMTP Username"
              value={config.smtp_username}
              onChange={(e) => setConfig({...config, smtp_username: e.target.value})}
            />
            <input
              type="password"
              placeholder="SMTP Password"
              value={config.smtp_password}
              onChange={(e) => setConfig({...config, smtp_password: e.target.value})}
            />
            <input
              type="email"
              placeholder="From Email"
              value={config.from_email}
              onChange={(e) => setConfig({...config, from_email: e.target.value})}
            />
            <input
              type="text"
              placeholder="From Name"
              value={config.from_name}
              onChange={(e) => setConfig({...config, from_name: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button type="button" onClick={testEmail} disabled={testing}>
              {testing ? 'Testing...' : 'Test Email'}
            </button>
          </div>
        </form>

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN APP ============
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Determine which interface to show based on URL
  const isManagerDomain = window.location.hostname.includes('manager');
  const isAdminDomain = window.location.hostname.includes('admin');

  if (isManagerDomain || isAdminDomain) {
    // Protected routes
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    if (isManagerDomain && (user.roles.includes('manager') || user.roles.includes('admin'))) {
      return <ManagerDashboard user={user} onLogout={handleLogout} />;
    }

    if (isAdminDomain && user.roles.includes('admin')) {
      return <AdminPanel user={user} onLogout={handleLogout} />;
    }

    return (
      <div className="page">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this area.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // Public upload interface
  return <PublicUpload />;
}

export default App;
