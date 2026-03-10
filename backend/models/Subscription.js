const pool = require('../config/database');

const Subscription = {
  async create({ user_id, plan, status = 'active', stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end }) {
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end]
    );
    return result.rows[0];
  },

  async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );
    return result.rows[0];
  },

  async findAllByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return result.rows;
  },

  async update(id, fields) {
    const allowed = ['plan', 'status', 'stripe_customer_id', 'stripe_subscription_id', 'current_period_start', 'current_period_end'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (!updates.length) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE subscriptions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async cancel(user_id) {
    const result = await pool.query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
       WHERE user_id = $1 AND status = 'active' RETURNING *`,
      [user_id]
    );
    return result.rows[0];
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT s.*, u.email FROM subscriptions s
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM subscriptions');
    return { subscriptions: result.rows, total: parseInt(count.rows[0].count) };
  },

  async findByStripeSubscriptionId(stripe_subscription_id) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripe_subscription_id]
    );
    return result.rows[0];
  }
};

module.exports = Subscription;
