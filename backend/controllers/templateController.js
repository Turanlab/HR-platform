const CVTemplate = require('../models/CVTemplate');
const Subscription = require('../models/Subscription');

const templateController = {
  async listTemplates(req, res, next) {
    try {
      const { category, page = 1, limit = 50 } = req.query;

      // Check if user has premium access
      let hasPremium = false;
      if (req.user) {
        const sub = await Subscription.findByUserId(req.user.id);
        hasPremium = sub && sub.status === 'active' && ['premium', 'professional', 'company_professional', 'enterprise'].includes(sub.plan);
      }

      const isPremiumFilter = hasPremium ? undefined : false;
      const result = await CVTemplate.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        category: category || undefined,
        is_premium: isPremiumFilter
      });

      res.json({ ...result, has_premium_access: hasPremium });
    } catch (err) {
      next(err);
    }
  },

  async getTemplate(req, res, next) {
    try {
      const template = await CVTemplate.findById(req.params.id);
      if (!template) return res.status(404).json({ error: 'Template not found.' });

      if (template.is_premium) {
        const sub = await Subscription.findByUserId(req.user.id);
        const hasPremium = sub && sub.status === 'active' && ['premium', 'professional', 'company_professional', 'enterprise'].includes(sub.plan);
        if (!hasPremium) {
          return res.status(402).json({ error: 'This template requires a premium subscription.', template_id: template.id });
        }
      }

      res.json({ template });
    } catch (err) {
      next(err);
    }
  },

  async createTemplate(req, res, next) {
    try {
      const { name, description, thumbnail_url, html_content, css_content, category, is_premium } = req.body;
      if (!name) return res.status(400).json({ error: 'Template name is required.' });
      const template = await CVTemplate.create({ name, description, thumbnail_url, html_content, css_content, category, is_premium });
      res.status(201).json({ template });
    } catch (err) {
      next(err);
    }
  },

  async updateTemplate(req, res, next) {
    try {
      const template = await CVTemplate.findById(req.params.id);
      if (!template) return res.status(404).json({ error: 'Template not found.' });
      const updated = await CVTemplate.update(req.params.id, req.body);
      res.json({ template: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteTemplate(req, res, next) {
    try {
      const template = await CVTemplate.findById(req.params.id);
      if (!template) return res.status(404).json({ error: 'Template not found.' });
      await CVTemplate.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = templateController;
