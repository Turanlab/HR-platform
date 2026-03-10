const pool = require('../config/database');

const UserCV = {
  async create({ user_id, template_id, title = 'My CV', personal_info = {}, education = [], experience = [], skills = [], languages = [], certifications = [], summary = '', parsed_data = {} }) {
    const result = await pool.query(
      `INSERT INTO user_cvs (user_id, template_id, title, personal_info, education, experience, skills, languages, certifications, summary, parsed_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [user_id, template_id, title, JSON.stringify(personal_info), JSON.stringify(education), JSON.stringify(experience), skills, JSON.stringify(languages), JSON.stringify(certifications), summary, JSON.stringify(parsed_data)]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT uc.*, ct.name as template_name, ct.html_content, ct.css_content
       FROM user_cvs uc
       LEFT JOIN cv_templates ct ON uc.template_id = ct.id
       WHERE uc.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByUserId(user_id, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT uc.id, uc.title, uc.status, uc.ats_score, uc.created_at, uc.updated_at,
              ct.name as template_name, ct.thumbnail_url
       FROM user_cvs uc
       LEFT JOIN cv_templates ct ON uc.template_id = ct.id
       WHERE uc.user_id = $1
       ORDER BY uc.updated_at DESC LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM user_cvs WHERE user_id = $1', [user_id]);
    return { cvs: result.rows, total: parseInt(count.rows[0].count) };
  },

  async update(id, fields) {
    const allowed = ['template_id', 'title', 'personal_info', 'education', 'experience', 'skills', 'languages', 'certifications', 'summary', 'parsed_data', 'ats_score', 'status'];
    const jsonFields = ['personal_info', 'education', 'experience', 'languages', 'certifications', 'parsed_data'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(jsonFields.includes(key) ? JSON.stringify(fields[key]) : fields[key]);
      }
    }

    if (!updates.length) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE user_cvs SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_cvs WHERE id = $1', [id]);
  },

  async updateAtsScore(id, ats_score) {
    const result = await pool.query(
      'UPDATE user_cvs SET ats_score = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [ats_score, id]
    );
    return result.rows[0];
  }
};

module.exports = UserCV;
