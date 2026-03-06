const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const templateController = require('../controllers/templateController');

router.get('/', authenticate, templateController.listTemplates);
router.get('/:id', authenticate, templateController.getTemplate);
router.post('/', authenticate, authorize('admin'), templateController.createTemplate);
router.put('/:id', authenticate, authorize('admin'), templateController.updateTemplate);
router.delete('/:id', authenticate, authorize('admin'), templateController.deleteTemplate);

module.exports = router;
