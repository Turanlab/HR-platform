const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

// Ensure upload directories exist
['cvs', 'avatars', 'logos'].forEach((dir) => {
  const fullPath = path.join(__dirname, '..', uploadsDir, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');

function storage(subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', uploadsDir, subdir));
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    }
  });
}

function cvFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed.'), false);
  }
}

function imageFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP).'), false);
  }
}

const upload = {
  single: multer({
    storage: storage('cvs'),
    fileFilter: cvFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }
  }).single('cv'),

  avatar: multer({
    storage: storage('avatars'),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  }).single('avatar'),

  bulk: multer({
    storage: storage('cvs'),
    fileFilter: cvFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }
  }).array('cvs', 50),

  logo: multer({
    storage: storage('logos'),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  }).single('logo')
};

module.exports = upload;
