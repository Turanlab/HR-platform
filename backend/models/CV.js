const pool = require('../config/database');

const CV = {
  async create({ candidate_id, file_path, file_name, file_size }) {
    const result = await pool.query(
      'INSERT INTO cvs (candidate_id, file_path, file_name, file_size) VALUES ($1, $2, $3, $4) RETURNING *',
      [candidate_id, file_path, file_name, file_size]
    );
    return result.rows[0];
  },

  async findByCandidateId(candidate_id) {
    const result = await pool.query('SELECT * FROM cvs WHERE candidate_id = $1 ORDER BY uploaded_at DESC', [candidate_id]);
    return result.rows;
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT cvs.*, candidates.name as candidate_name, candidates.email as candidate_email
       FROM cvs LEFT JOIN candidates ON cvs.candidate_id = candidates.id
       ORDER BY cvs.uploaded_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM cvs');
    return { cvs: result.rows, total: parseInt(count.rows[0].count) };
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM cvs WHERE id = $1', [id]);
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM cvs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM cvs');
    return parseInt(result.rows[0].count);
  }
};

module.exports = CV;
