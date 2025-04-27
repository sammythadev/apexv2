const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT id, username, email, balance FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateBalance(userId, amount) {
    await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
  }
}

module.exports = User;