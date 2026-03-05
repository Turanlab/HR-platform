const pool = require('../config/database');

const Candidate = {
  async create({ name, email, phone, location, skills, experience_years, salary_expectation, user_id }) {
    const result = await pool.query(
      `INSERT INTO candidates (name, email, phone, location, skills, experience_years, salary_expectation, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, phone, location, skills, experience_years, salary_expectation, user_id]
    );
    return result.rows[0];
  },

  async findAll({ page = 1, limit = 20, search, skills, location, min_experience, max_experience } = {}) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR skills ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (skills) {
      conditions.push(`skills ILIKE $${idx}`);
      params.push(`%${skills}%`);
      idx++;
    }
    if (location) {
      conditions.push(`location ILIKE $${idx}`);
      params.push(`%${location}%`);
      idx++;
    }
    if (min_experience !== undefined) {
      conditions.push(`experience_years >= $${idx}`);
      params.push(min_experience);
      idx++;
    }
    if (max_experience !== undefined) {
      conditions.push(`experience_years <= $${idx}`);
      params.push(max_experience);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT * FROM candidates ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM candidates ${where}`, params);
    return { candidates: result.rows, total: parseInt(count.rows[0].count) };
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM candidates WHERE id = $1', [id]);
    return result.rows[0];
  },

  async update(id, { name, email, phone, location, skills, experience_years, salary_expectation }) {
    const result = await pool.query(
      `UPDATE candidates SET name=$1, email=$2, phone=$3, location=$4, skills=$5,
       experience_years=$6, salary_expectation=$7 WHERE id=$8 RETURNING *`,
      [name, email, phone, location, skills, experience_years, salary_expectation, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM candidates WHERE id = $1', [id]);
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM candidates');
    return parseInt(result.rows[0].count);
  }
};

module.exports = Candidate;
