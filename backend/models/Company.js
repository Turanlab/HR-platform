const pool = require('../config/database');

const Company = {
  async create({ user_id, name, industry, size, website, description, logo_url }) {
    const result = await pool.query(
      `INSERT INTO company_profiles (user_id, name, industry, size, website, description, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, name, industry, size, website, description, logo_url]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM company_profiles WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUserId(user_id) {
    const result = await pool.query('SELECT * FROM company_profiles WHERE user_id = $1', [user_id]);
    return result.rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'industry', 'size', 'website', 'description', 'logo_url', 'subscription_tier', 'subscription_expires_at'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (!updates.length) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE company_profiles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async findAll({ page = 1, limit = 20, search, industry } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (industry) {
      conditions.push(`industry = $${idx}`);
      params.push(industry);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT * FROM company_profiles ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM company_profiles ${where}`, params);
    return { companies: result.rows, total: parseInt(count.rows[0].count) };
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM company_profiles');
    return parseInt(result.rows[0].count);
  }
};

module.exports = Company;
