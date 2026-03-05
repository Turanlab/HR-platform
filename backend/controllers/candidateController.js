const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, location, skills, experience_years, salary_expectation } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    const candidate = await Candidate.create({
      name, email, phone, location, skills, experience_years, salary_expectation,
      user_id: req.user.id
    });
    await AuditLog.create({ user_id: req.user.id, action: 'CREATE_CANDIDATE', resource: `candidates/${candidate.id}` });
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
};

const listCandidates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, skills, location, min_experience, max_experience } = req.query;
    const data = await Candidate.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      skills,
      location,
      min_experience: min_experience !== undefined ? parseInt(min_experience) : undefined,
      max_experience: max_experience !== undefined ? parseInt(max_experience) : undefined
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

const updateCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, location, skills, experience_years, salary_expectation } = req.body;
    const candidate = await Candidate.update(req.params.id, { name, email, phone, location, skills, experience_years, salary_expectation });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }
    await AuditLog.create({ user_id: req.user.id, action: 'UPDATE_CANDIDATE', resource: `candidates/${req.params.id}` });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    await Candidate.delete(req.params.id);
    await AuditLog.create({ user_id: req.user.id, action: 'DELETE_CANDIDATE', resource: `candidates/${req.params.id}` });
    res.json({ message: 'Candidate deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCandidate, listCandidates, getCandidate, updateCandidate, deleteCandidate };
