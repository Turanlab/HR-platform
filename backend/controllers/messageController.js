const Message = require('../models/Message');
const emailService = require('../utils/emailService');
const User = require('../models/User');

const messageController = {
  async getConversations(req, res, next) {
    try {
      const conversations = await Message.findConversations(req.user.id);
      const unreadCount = await Message.getUnreadCount(req.user.id);
      res.json({ conversations, unreadCount });
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const result = await Message.findMessages(conversationId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { receiver_id, content } = req.body;
      if (!receiver_id || !content) {
        return res.status(400).json({ error: 'receiver_id and content are required.' });
      }

      const conversation = await Message.findOrCreateConversation(req.user.id, parseInt(receiver_id));
      const message = await Message.createMessage({
        sender_id: req.user.id,
        receiver_id: parseInt(receiver_id),
        conversation_id: conversation.id,
        content
      });

      // Emit real-time event if socket.io is set up
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${receiver_id}`).emit('new_message', { message, conversation_id: conversation.id });
      }

      // Send email notification asynchronously (non-blocking)
      User.findById(receiver_id).then((receiver) => {
        if (receiver) {
          emailService.sendMessageNotification(receiver.email, req.user.email, content.substring(0, 100)).catch(() => {});
        }
      }).catch(() => {});

      res.status(201).json({ message, conversation_id: conversation.id });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req, res, next) {
    try {
      const { conversationId } = req.params;
      await Message.markAsRead(conversationId, req.user.id);

      const io = req.app.get('io');
      if (io) {
        io.to(`conversation_${conversationId}`).emit('message_read', { conversation_id: conversationId, user_id: req.user.id });
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async deleteConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      await require('../config/database').query('DELETE FROM messages WHERE conversation_id = $1', [conversationId]);
      await require('../config/database').query('DELETE FROM conversations WHERE id = $1', [conversationId]);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = messageController;
