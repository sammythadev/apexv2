const pool = require('../config/db');
const { getBTCPrice } = require('../services/cryptoService');

const createDeposit = async (req, res) => {
  const { userId } = req.user;
  const { amount, currency, plan } = req.body;
  
  try {
    // Convert USD to BTC if needed
    let cryptoAmount = amount;
    if (currency === 'USD') {
      const btcPrice = await getBTCPrice();
      cryptoAmount = amount / btcPrice;
    }
    
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, currency, type, plan, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, cryptoAmount, currency, 'deposit', plan, 'pending']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWithdrawal = async (req, res) => {
  const { userId } = req.user;
  const { amount, currency, walletAddress } = req.body;
  
  try {
    // Check user balance
    const user = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
    if (user.rows[0].balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, currency, type, status, tx_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, amount, currency, 'withdrawal', 'pending', walletAddress]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  const { userId } = req.user;
  
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDeposit, createWithdrawal, getTransactions };