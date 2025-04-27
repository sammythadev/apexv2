const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendVerificationEmail } = require('../services/emailService');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, verificationToken]
    );
    
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({ message: 'User registered. Please check your email for verification.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [decoded.email]);
    res.redirect(process.env.FRONTEND_URL + '/login?verified=true');
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.rows[0].is_verified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }
    
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (admin.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In production, use bcrypt.compare
    if (password !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ adminId: admin.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { id: admin.rows[0].id, username: admin.rows[0].username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, verifyEmail, login, adminLogin };