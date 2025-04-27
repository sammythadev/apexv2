const pool = require('../config/db');

class Transaction {
  static async create({ userId, amount, currency, type, plan, status = 'pending' }) {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, currency, type, plan, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, amount, currency, type, plan, status]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async findPending() {
    const result = await pool.query("SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at DESC");
    return result.rows;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', [status, id]);
  }
}

module.exports = Transaction;