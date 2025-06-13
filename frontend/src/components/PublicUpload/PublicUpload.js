import React, { useState } from 'react';

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
          {result.success && (
            <p>
              <strong>Upload ID:</strong> {result.uploadId}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicUpload;
