const pool = require('../config/database');

const AuditLog = {
  async create({ user_id, action, resource }) {
    const result = await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource) VALUES ($1, $2, $3) RETURNING *',
      [user_id, action, resource]
    );
    return result.rows[0];
  },

  async findAll({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT al.*, u.email as user_email FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.timestamp DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM audit_logs');
    return { logs: result.rows, total: parseInt(count.rows[0].count) };
  }
};

module.exports = AuditLog;
