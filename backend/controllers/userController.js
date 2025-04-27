const pool = require('../config/db');

const getUserProfile = async (req, res) => {
  const { userId } = req.user;
  
  try {
    const result = await pool.query('SELECT id, username, email, balance, created_at FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  const { username, email } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email',
      [username, email, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserBalance = async (req, res) => {
  const { userId } = req.user;
  
  try {
    const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getUserBalance };