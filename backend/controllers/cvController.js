const path = require('path');
const fs = require('fs');
const CV = require('../models/CV');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

const uploadCV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { candidate_id } = req.body;
    if (!candidate_id) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'candidate_id is required.' });
    }
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    const cv = await CV.create({
      candidate_id,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size
    });
    await AuditLog.create({ user_id: req.user.id, action: 'UPLOAD_CV', resource: `cvs/${cv.id}` });
    res.status(201).json(cv);
  } catch (err) {
    next(err);
  }
};

const bulkUploadCV = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }
    const results = [];
    for (const file of req.files) {
      const candidateName = path.parse(file.originalname).name;
      let candidate = await Candidate.create({
        name: candidateName,
        email: null,
        phone: null,
        location: null,
        skills: null,
        experience_years: null,
        salary_expectation: null,
        user_id: req.user.id
      });
      const cv = await CV.create({
        candidate_id: candidate.id,
        file_path: file.path,
        file_name: file.originalname,
        file_size: file.size
      });
      results.push({ candidate, cv });
    }
    await AuditLog.create({ user_id: req.user.id, action: 'BULK_UPLOAD_CVS', resource: 'cvs' });
    res.status(201).json({ uploaded: results.length, results });
  } catch (err) {
    next(err);
  }
};

const listCVs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await CV.findAll({ page: parseInt(page), limit: parseInt(limit) });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteCV = async (req, res, next) => {
  try {
    const cv = await CV.delete(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found.' });
    }
    fs.unlink(cv.file_path, () => {});
    await AuditLog.create({ user_id: req.user.id, action: 'DELETE_CV', resource: `cvs/${req.params.id}` });
    res.json({ message: 'CV deleted.' });
  } catch (err) {
    next(err);
  }
};

const downloadCV = async (req, res, next) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found.' });
    }
    res.download(cv.file_path, cv.file_name);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadCV, bulkUploadCV, listCVs, deleteCV, downloadCV };
