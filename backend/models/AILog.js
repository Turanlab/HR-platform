const pool = require('../config/database');

const AILog = {
  async create({ user_id, action, prompt_tokens = 0, completion_tokens = 0, model, cost = 0 }) {
    const result = await pool.query(
      `INSERT INTO ai_logs (user_id, action, prompt_tokens, completion_tokens, model, cost)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, action, prompt_tokens, completion_tokens, model, cost]
    );
    return result.rows[0];
  },

  async findAll({ page = 1, limit = 50, user_id, action } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (user_id) {
      conditions.push(`al.user_id = $${idx++}`);
      params.push(user_id);
    }
    if (action) {
      conditions.push(`al.action = $${idx++}`);
      params.push(action);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT al.*, u.email FROM ai_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${where} ORDER BY al.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM ai_logs al ${where}`, params);
    return { logs: result.rows, total: parseInt(count.rows[0].count) };
  },

  async getTotalCost() {
    const result = await pool.query('SELECT SUM(cost) as total_cost, COUNT(*) as total_requests FROM ai_logs');
    return result.rows[0];
  },

  async getByUser(user_id, { page = 1, limit = 20 } = {}) {
    return this.findAll({ page, limit, user_id });
  }
};

module.exports = AILog;
