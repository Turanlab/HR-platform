const pool = require('../config/database');

const Message = {
  async createConversation(participant1_id, participant2_id) {
    const [p1, p2] = [Math.min(participant1_id, participant2_id), Math.max(participant1_id, participant2_id)];
    const result = await pool.query(
      `INSERT INTO conversations (participant1_id, participant2_id)
       VALUES ($1, $2) RETURNING *`,
      [p1, p2]
    );
    return result.rows[0];
  },

  async findOrCreateConversation(userId1, userId2) {
    const [p1, p2] = [Math.min(userId1, userId2), Math.max(userId1, userId2)];
    let result = await pool.query(
      'SELECT * FROM conversations WHERE participant1_id = $1 AND participant2_id = $2',
      [p1, p2]
    );
    if (result.rows[0]) return result.rows[0];
    return this.createConversation(p1, p2);
  },

  async createMessage({ sender_id, receiver_id, conversation_id, content }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const msgResult = await client.query(
        `INSERT INTO messages (sender_id, receiver_id, conversation_id, content)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [sender_id, receiver_id, conversation_id, content]
      );
      await client.query(
        'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
        [conversation_id]
      );
      await client.query('COMMIT');
      return msgResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async findMessages(conversation_id, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT m.*, u.email as sender_email, u.full_name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversation_id, limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM messages WHERE conversation_id = $1', [conversation_id]);
    return { messages: result.rows, total: parseInt(count.rows[0].count) };
  },

  async findConversations(user_id) {
    const result = await pool.query(
      `SELECT c.*,
         u1.email as p1_email, u1.full_name as p1_name, u1.avatar_url as p1_avatar,
         u2.email as p2_email, u2.full_name as p2_name, u2.avatar_url as p2_avatar,
         (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count
       FROM conversations c
       LEFT JOIN users u1 ON c.participant1_id = u1.id
       LEFT JOIN users u2 ON c.participant2_id = u2.id
       WHERE c.participant1_id = $1 OR c.participant2_id = $1
       ORDER BY c.last_message_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  async markAsRead(conversation_id, user_id) {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2',
      [conversation_id, user_id]
    );
  },

  async getUnreadCount(user_id) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
         AND m.sender_id != $1
         AND m.is_read = false`,
      [user_id]
    );
    return parseInt(result.rows[0].count);
  }
};

module.exports = Message;
