const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());

// Password validation rule: min 8 chars, 1 uppercase, 1 digit, 1 special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const isPasswordValid = (password) => {
  return typeof password === 'string' && PASSWORD_REGEX.test(password);
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', app: 'aleph-app-api' });
});

// 1. Sign Up (Register)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate password strength
  if (!isPasswordValid(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
    });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Sign In (Login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 3. Request Password Reset Token
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    const result = await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id',
      [resetToken, expiresAt, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    res.json({ message: 'Reset token generated successfully', resetToken });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error processing password reset' });
  }
});

// 4. Reset Password with Token
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  // Validate password strength
  if (!isPasswordValid(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
    });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const userId = result.rows[0].id;
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password has been successfully updated' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

app.listen(PORT, () => {
  console.log(`Aleph backend server running on port ${PORT}`);
});