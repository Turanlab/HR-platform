const pool = require('../config/database');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const CV = require('../models/CV');
const AuditLog = require('../models/AuditLog');

const getStats = async (req, res, next) => {
  try {
    const [cvCount, candidateCount, userCount, logCount] = await Promise.all([
      CV.count(),
      Candidate.count(),
      pool.query('SELECT COUNT(*) FROM users').then(r => parseInt(r.rows[0].count)),
      pool.query('SELECT COUNT(*) FROM audit_logs').then(r => parseInt(r.rows[0].count))
    ]);
    res.json({
      total_cvs: cvCount,
      total_candidates: candidateCount,
      total_users: userCount,
      total_audit_logs: logCount
    });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await User.findAll({ page: parseInt(page), limit: parseInt(limit) });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const exists = await User.emailExists(email);
    if (exists) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const allowedRoles = ['admin', 'recruiter', 'hr_manager'];
    const userRole = allowedRoles.includes(role) ? role : 'recruiter';
    const user = await User.create({ email, password, role: userRole });
    await AuditLog.create({ user_id: req.user.id, action: 'CREATE_USER', resource: `users/${user.id}` });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'recruiter', 'hr_manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const user = await User.updateRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await AuditLog.create({ user_id: req.user.id, action: 'UPDATE_USER_ROLE', resource: `users/${req.params.id}` });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }
    await User.delete(req.params.id);
    await AuditLog.create({ user_id: req.user.id, action: 'DELETE_USER', resource: `users/${req.params.id}` });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const data = await AuditLog.findAll({ page: parseInt(page), limit: parseInt(limit) });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, listUsers, createUser, updateUserRole, deleteUser, getAuditLogs };
