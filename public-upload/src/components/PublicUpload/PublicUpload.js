import React, { useState } from 'react';
import './PublicUpload.css';

const PublicUpload = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://api.localhost';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !uploaderEmail) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('uploaderEmail', uploaderEmail);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult({ success: true, message: data.message, uploadId: data.uploadId });
      setFile(null);
      setDescription('');
      setUploaderEmail('');
    } catch (error) {
      setResult({ success: false, message: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="public-upload">
      <header className="header">
        <h1>🚀 File Upload System</h1>
        <p>Upload your files for approval. No account required!</p>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="email">Your email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={uploaderEmail}
              onChange={(e) => setUploaderEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group file-upload">
            <label htmlFor="file">Choose a file</label>
            <div className="file-input-wrapper">
              <input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <span className="file-custom">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="upload-button"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>


        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <p>{result.message}</p>
            {result.success && (
              <p className="upload-id">
                <strong>Upload ID:</strong> {result.uploadId}
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Need access to the dashboard? <a href="http://login.localhost:3000">Login here</a></p>
      </footer>
    </div>
  );
};

export default PublicUpload;
