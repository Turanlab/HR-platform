const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createCandidate, listCandidates, getCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidateController');

router.get('/', authenticate, listCandidates);
router.post('/', authenticate, createCandidate);
router.get('/:id', authenticate, getCandidate);
router.put('/:id', authenticate, updateCandidate);
router.delete('/:id', authenticate, deleteCandidate);

module.exports = router;
