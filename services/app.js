const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database and Redis connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/uploaddb'
});

const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(console.error);

// File upload configuration
const upload = multer({
  dest: '/app/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => cb(null, true)
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'upload-system-backend' });
});

// ============ AUTH ENDPOINTS ============
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Store session
    const sessionId = `session:${user.id}:${Date.now()}`;
    await redis.setEx(sessionId, 86400, JSON.stringify(user));

    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 86400000 });
    res.json({ success: true, token, user: { id: user.id, email: user.email, roles: user.roles } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/auth/verify-manager', async (req, res) => {
  try {
    const user = await verifyAuth(req);
    if (!user || (!user.roles.includes('manager') && !user.roles.includes('admin'))) {
      return res.status(403).json({ error: 'Manager access required' });
    }

    res.set({
      'X-User-ID': user.id.toString(),
      'X-User-Email': user.email,
      'X-User-Roles': JSON.stringify(user.roles)
    });
    res.json({ success: true, user: user.email });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

app.get('/auth/verify-admin', async (req, res) => {
  try {
    const user = await verifyAuth(req);
    if (!user || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.set({
      'X-User-ID': user.id.toString(),
      'X-User-Email': user.email,
      'X-User-Roles': JSON.stringify(user.roles)
    });
    res.json({ success: true, user: user.email });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// ============ UPLOAD ENDPOINTS (PUBLIC) ============
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, path: tempPath } = req.file;
    const { description = '', uploaderEmail = '' } = req.body;
    const filename = `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Store in database
    const result = await pool.query(
      'INSERT INTO uploads (filename, original_name, mimetype, size, description, uploader_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [filename, originalname, mimetype, size, description, uploaderEmail]
    );

    // Move file to permanent location
    const newPath = path.join('/app/uploads', filename);
    await fs.rename(tempPath, newPath);

    res.json({
      success: true,
      uploadId: result.rows[0].id,
      filename: filename,
      message: 'File uploaded successfully and pending approval'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Check if file is approved
    const result = await pool.query('SELECT * FROM uploads WHERE filename = $1 AND status = $2', [filename, 'approved']);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found or not approved' });
    }

    const upload = result.rows[0];
    const filePath = path.join('/app/uploads', filename);

    res.set({
      'Content-Type': upload.mimetype,
      'Content-Disposition': `attachment; filename="${upload.original_name}"`
    });

    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// ============ MANAGER ENDPOINTS ============
app.get('/api/manager/pending', async (req, res) => {
  try {
    const user = getUserFromHeaders(req);
    const result = await pool.query(
      'SELECT id, filename, original_name, uploader_email, description, uploaded_at, size, mimetype FROM uploads WHERE status = $1 ORDER BY uploaded_at DESC',
      ['pending']
    );

    res.json({
      success: true,
      uploads: result.rows,
      managedBy: user.email,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Failed to get pending uploads:', error);
    res.status(500).json({ error: 'Failed to get pending uploads' });
  }
});

app.post('/api/manager/approve/:id', async (req, res) => {
  try {
    const user = getUserFromHeaders(req);
    const { id } = req.params;

    // Update status
    await pool.query(
      'UPDATE uploads SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['approved', user.email, id]
    );

    // Get upload details for notification
    const result = await pool.query('SELECT * FROM uploads WHERE id = $1', [id]);
    const upload = result.rows[0];

    // Send approval email
    if (upload && upload.uploader_email) {
      await sendApprovalEmail(upload, user.email);
    }

    res.json({
      success: true,
      message: 'Upload approved successfully',
      approvedBy: user.email
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve upload' });
  }
});

app.post('/api/manager/reject/:id', async (req, res) => {
  try {
    const user = getUserFromHeaders(req);
    const { id } = req.params;
    const { reason } = req.body;

    // Get upload details before deletion
    const result = await pool.query('SELECT * FROM uploads WHERE id = $1', [id]);
    const upload = result.rows[0];

    // Update status
    await pool.query(
      'UPDATE uploads SET status = $1, rejection_reason = $2, approved_by = $3, approved_at = CURRENT_TIMESTAMP WHERE id = $4',
      ['rejected', reason, user.email, id]
    );

    // Delete file
    try {
      await fs.unlink(path.join('/app/uploads', upload.filename));
    } catch (err) {
      console.error('Failed to delete file:', err);
    }

    // Send rejection email
    if (upload && upload.uploader_email) {
      await sendRejectionEmail(upload, user.email, reason);
    }

    res.json({
      success: true,
      message: 'Upload rejected',
      rejectedBy: user.email
    });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Failed to reject upload' });
  }
});

// ============ ADMIN ENDPOINTS ============
app.get('/api/admin/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM config WHERE key = $1', ['email_config']);
    const config = result.rows[0] ? JSON.parse(result.rows[0].value) : {};

    // Don't return password
    delete config.smtp_password;

    res.json(config);
  } catch (error) {
    console.error('Failed to get config:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

app.put('/api/admin/config', async (req, res) => {
  try {
    const user = getUserFromHeaders(req);
    const config = req.body;

    // Get existing config
    const result = await pool.query('SELECT value FROM config WHERE key = $1', ['email_config']);
    const existingConfig = result.rows[0] ? JSON.parse(result.rows[0].value) : {};

    // Merge configs (don't overwrite password if not provided)
    const newConfig = { ...existingConfig, ...config };
    if (!config.smtp_password) {
      delete newConfig.smtp_password;
      newConfig.smtp_password = existingConfig.smtp_password;
    }

    // Update config
    await pool.query(
      'INSERT INTO config (key, value, updated_by) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP',
      ['email_config', JSON.stringify(newConfig), user.email]
    );

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      updated_by: user.email
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

app.post('/api/admin/test-email', async (req, res) => {
  try {
    const user = getUserFromHeaders(req);

    // Get email config
    const result = await pool.query('SELECT value FROM config WHERE key = $1', ['email_config']);
    const config = result.rows[0] ? JSON.parse(result.rows[0].value) : {};

    // Send test email
    await sendTestEmail(config, user.email);

    res.json({
      success: true,
      message: `Test email sent successfully to ${user.email}`
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.json({
      success: false,
      error: `Test email failed: ${error.message}`
    });
  }
});

// ============ HELPER FUNCTIONS ============
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  const sessionCookie = req.headers.cookie;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  } else if (sessionCookie) {
    const match = sessionCookie.match(/sessionId=([^;]+)/);
    if (match) {
      const sessionData = await redis.get(match[1]);
      return sessionData ? JSON.parse(sessionData) : null;
    }
  }

  throw new Error('No authentication provided');
}

function getUserFromHeaders(req) {
  return {
    id: req.headers['x-user-id'],
    email: req.headers['x-user-email'],
    roles: JSON.parse(req.headers['x-user-roles'] || '[]')
  };
}

async function sendApprovalEmail(upload, approvedBy) {
  try {
    const config = await getEmailConfig();
    const transporter = nodemailer.createTransporter({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: false,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password
      }
    });

    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: upload.uploader_email,
      subject: `File Approved: ${upload.original_name}`,
      html: `
        <h2>Your file has been approved! ✅</h2>
        <p>Your uploaded file "<strong>${upload.original_name}</strong>" has been approved by ${approvedBy}.</p>
        <p>Download: <a href="https://api.localhost/api/files/${upload.filename}">Click here</a></p>
      `
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}

async function sendRejectionEmail(upload, rejectedBy, reason) {
  try {
    const config = await getEmailConfig();
    const transporter = nodemailer.createTransporter({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: false,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password
      }
    });

    await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: upload.uploader_email,
      subject: `File Rejected: ${upload.original_name}`,
      html: `
        <h2>Your file was rejected ❌</h2>
        <p>Your uploaded file "<strong>${upload.original_name}</strong>" has been rejected by ${rejectedBy}.</p>
        <p><strong>Reason:</strong> ${reason}</p>
      `
    });
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
}

async function sendTestEmail(config, testEmail) {
  const transporter = nodemailer.createTransporter({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: false,
    auth: {
      user: config.smtp_username,
      pass: config.smtp_password
    }
  });

  await transporter.sendMail({
    from: `"${config.from_name}" <${config.from_email}>`,
    to: testEmail,
    subject: 'Test Email - Upload System',
    text: 'This is a test email from the upload system configuration.'
  });
}

async function getEmailConfig() {
  const result = await pool.query('SELECT value FROM config WHERE key = $1', ['email_config']);
  return result.rows[0] ? JSON.parse(result.rows[0].value) : {};
}

// ============ ERROR HANDLING ============
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ultimate Upload System Backend running on port ${PORT}`);
});
