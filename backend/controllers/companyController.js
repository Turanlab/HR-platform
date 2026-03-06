const Company = require('../models/Company');
const Candidate = require('../models/Candidate');

const companyController = {
  async createCompany(req, res, next) {
    try {
      const { name, industry, size, website, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Company name is required.' });

      const logo_url = req.file ? `/uploads/logos/${req.file.filename}` : null;
      const company = await Company.create({
        user_id: req.user.id,
        name, industry, size, website, description, logo_url
      });
      res.status(201).json({ company });
    } catch (err) {
      next(err);
    }
  },

  async getCompany(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ error: 'Company not found.' });
      res.json({ company });
    } catch (err) {
      next(err);
    }
  },

  async updateCompany(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ error: 'Company not found.' });
      if (company.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      const updates = { ...req.body };
      if (req.file) updates.logo_url = `/uploads/logos/${req.file.filename}`;

      const updated = await Company.update(req.params.id, updates);
      res.json({ company: updated });
    } catch (err) {
      next(err);
    }
  },

  async searchCandidates(req, res, next) {
    try {
      const { search, skills, location, min_experience, max_experience, page = 1, limit = 20 } = req.query;
      const result = await Candidate.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        skills,
        location,
        min_experience: min_experience !== undefined ? parseInt(min_experience) : undefined,
        max_experience: max_experience !== undefined ? parseInt(max_experience) : undefined
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ error: 'Company not found.' });
      if (company.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      // Return mock analytics (in production these would come from tracking tables)
      res.json({
        analytics: {
          profile_views: Math.floor(Math.random() * 500) + 50,
          candidate_searches: Math.floor(Math.random() * 200) + 10,
          messages_sent: Math.floor(Math.random() * 50) + 5,
          candidates_contacted: Math.floor(Math.random() * 30) + 2,
          period: 'last_30_days'
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async listCompanies(req, res, next) {
    try {
      const { page = 1, limit = 20, search, industry } = req.query;
      const result = await Company.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        industry
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = companyController;
