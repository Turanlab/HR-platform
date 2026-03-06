const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversations/:conversationId', authenticate, messageController.getMessages);
router.post('/', authenticate, messageController.sendMessage);
router.put('/conversations/:conversationId/read', authenticate, messageController.markRead);
router.delete('/conversations/:conversationId', authenticate, messageController.deleteConversation);

module.exports = router;
