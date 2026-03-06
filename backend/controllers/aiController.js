const aiService = require('../utils/aiService');
const pdfParser = require('../utils/pdfParser');
const AILog = require('../models/AILog');

const aiController = {
  async parseCV(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

      const { text, pageCount, metadata } = await pdfParser.parseFile(req.file.path, req.file.mimetype);
      if (!text) return res.status(422).json({ error: 'Could not extract text from file.' });

      const parsed = await aiService.parseCV(text, req.user.id);
      res.json({ parsed, text_preview: text.substring(0, 500), page_count: pageCount, metadata });
    } catch (err) {
      next(err);
    }
  },

  async checkGrammar(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'text is required.' });
      const result = await aiService.checkGrammar(text, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async suggestImprovements(req, res, next) {
    try {
      const { cvData } = req.body;
      if (!cvData) return res.status(400).json({ error: 'cvData is required.' });
      const result = await aiService.suggestImprovements(cvData, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async generateCoverLetter(req, res, next) {
    try {
      const { cvData, jobDescription } = req.body;
      if (!cvData || !jobDescription) {
        return res.status(400).json({ error: 'cvData and jobDescription are required.' });
      }
      const result = await aiService.generateCoverLetter(cvData, jobDescription, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async extractSkills(req, res, next) {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'text is required.' });
      const result = await aiService.extractSkills(text, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async calculateAtsScore(req, res, next) {
    try {
      const { cvData, jobDescription } = req.body;
      if (!cvData || !jobDescription) {
        return res.status(400).json({ error: 'cvData and jobDescription are required.' });
      }
      const result = await aiService.calculateAtsScore(cvData, jobDescription, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async matchJob(req, res, next) {
    try {
      const { cvData, jobDescription } = req.body;
      if (!cvData || !jobDescription) {
        return res.status(400).json({ error: 'cvData and jobDescription are required.' });
      }
      const result = await aiService.matchCandidateToJob(cvData, jobDescription, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getUsageLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, user_id, action } = req.query;
      const [logs, totals] = await Promise.all([
        AILog.findAll({ page: parseInt(page), limit: parseInt(limit), user_id, action }),
        AILog.getTotalCost()
      ]);
      res.json({ ...logs, totals });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = aiController;
