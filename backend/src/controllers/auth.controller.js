import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

/**
 * Register a new user account
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalUsername = username || email.split('@')[0];

    // Insert user into PostgreSQL
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [finalUsername, email, hashedPassword]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * Login existing user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * Get current user profile
 */
export const me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};