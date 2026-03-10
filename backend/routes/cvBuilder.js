const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const cvBuilderController = require('../controllers/cvBuilderController');

router.post('/', authenticate, cvBuilderController.createCV);
router.get('/', authenticate, cvBuilderController.getUserCVs);
router.get('/:id', authenticate, cvBuilderController.getCVById);
router.put('/:id', authenticate, cvBuilderController.updateCV);
router.delete('/:id', authenticate, cvBuilderController.deleteCV);
router.post('/:id/export', authenticate, cvBuilderController.exportPDF);
router.post('/:id/duplicate', authenticate, cvBuilderController.duplicateCV);

module.exports = router;
