const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { uploadCV, bulkUploadCV, listCVs, deleteCV, downloadCV } = require('../controllers/cvController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed.'));
  }
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

router.post('/upload', authenticate, upload.single('cv'), uploadCV);
router.post('/bulk-upload', authenticate, upload.array('cvs', 50), bulkUploadCV);
router.get('/', authenticate, listCVs);
router.delete('/:id', authenticate, deleteCV);
router.get('/:id/download', authenticate, downloadCV);

module.exports = router;
