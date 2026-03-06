const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const companyController = require('../controllers/companyController');

router.post('/', authenticate, upload.logo, companyController.createCompany);
router.get('/search/candidates', authenticate, companyController.searchCandidates);
router.get('/', authenticate, authorize('admin'), companyController.listCompanies);
router.get('/:id', authenticate, companyController.getCompany);
router.put('/:id', authenticate, upload.logo, companyController.updateCompany);
router.get('/:id/analytics', authenticate, companyController.getAnalytics);

module.exports = router;
