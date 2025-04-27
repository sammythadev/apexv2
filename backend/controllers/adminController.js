const pool = require('../config/db');

const getPendingTransactions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    // Update transaction status
    await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', [status, id]);
    
    // If approved deposit, update user balance
    if (status === 'approved') {
      const tx = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      if (tx.rows[0].type === 'deposit') {
        await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', 
          [tx.rows[0].amount, tx.rows[0].user_id]);
      } else if (tx.rows[0].type === 'withdrawal') {
        await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', 
          [tx.rows[0].amount, tx.rows[0].user_id]);
      }
    }
    
    res.json({ message: 'Transaction status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupportMessages = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendSupportMessage = async (req, res) => {
  const { message, userId } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO chats (user_id, message, is_admin) VALUES ($1, $2, $3) RETURNING *',
      [userId, message, true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getPendingTransactions, 
  updateTransactionStatus,
  getSupportMessages,
  sendSupportMessage
};