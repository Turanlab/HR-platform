const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const aiController = require('../controllers/aiController');

router.post('/parse-cv', authenticate, upload.single, aiController.parseCV);
router.post('/check-grammar', authenticate, aiController.checkGrammar);
router.post('/suggest-improvements', authenticate, aiController.suggestImprovements);
router.post('/generate-cover-letter', authenticate, aiController.generateCoverLetter);
router.post('/extract-skills', authenticate, aiController.extractSkills);
router.post('/ats-score', authenticate, aiController.calculateAtsScore);
router.post('/match-job', authenticate, aiController.matchJob);
router.get('/logs', authenticate, authorize('admin'), aiController.getUsageLogs);

module.exports = router;
