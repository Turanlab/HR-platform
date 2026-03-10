const pool = require('../config/database');

const CVTemplate = {
  async findAll({ page = 1, limit = 50, category, is_premium } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }
    if (is_premium !== undefined && is_premium !== null) {
      conditions.push(`is_premium = $${idx++}`);
      params.push(is_premium);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT id, name, description, thumbnail_url, category, is_premium, created_at
       FROM cv_templates ${where} ORDER BY is_premium ASC, name ASC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM cv_templates ${where}`, params);
    return { templates: result.rows, total: parseInt(count.rows[0].count) };
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM cv_templates WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, description, thumbnail_url, html_content, css_content, category, is_premium = false }) {
    const result = await pool.query(
      `INSERT INTO cv_templates (name, description, thumbnail_url, html_content, css_content, category, is_premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, thumbnail_url, html_content, css_content, category, is_premium]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'description', 'thumbnail_url', 'html_content', 'css_content', 'category', 'is_premium'];
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
      `UPDATE cv_templates SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM cv_templates WHERE id = $1', [id]);
  },

  async findByCategory(category) {
    const result = await pool.query(
      'SELECT id, name, description, thumbnail_url, category, is_premium FROM cv_templates WHERE category = $1 ORDER BY name',
      [category]
    );
    return result.rows;
  },

  async findPremium() {
    const result = await pool.query(
      'SELECT id, name, description, thumbnail_url, category, is_premium FROM cv_templates WHERE is_premium = true ORDER BY name'
    );
    return result.rows;
  }
};

module.exports = CVTemplate;
