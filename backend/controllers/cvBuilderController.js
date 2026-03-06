const UserCV = require('../models/UserCV');

const cvBuilderController = {
  async createCV(req, res, next) {
    try {
      const { template_id, title, personal_info, education, experience, skills, languages, certifications, summary } = req.body;
      const cv = await UserCV.create({
        user_id: req.user.id,
        template_id: template_id || null,
        title: title || 'My CV',
        personal_info: personal_info || {},
        education: education || [],
        experience: experience || [],
        skills: skills || [],
        languages: languages || [],
        certifications: certifications || [],
        summary: summary || '',
        parsed_data: {}
      });
      res.status(201).json({ cv });
    } catch (err) {
      next(err);
    }
  },

  async getUserCVs(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await UserCV.findByUserId(req.user.id, { page: parseInt(page), limit: parseInt(limit) });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getCVById(req, res, next) {
    try {
      const cv = await UserCV.findById(req.params.id);
      if (!cv) return res.status(404).json({ error: 'CV not found.' });
      if (cv.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }
      res.json({ cv });
    } catch (err) {
      next(err);
    }
  },

  async updateCV(req, res, next) {
    try {
      const cv = await UserCV.findById(req.params.id);
      if (!cv) return res.status(404).json({ error: 'CV not found.' });
      if (cv.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      const updated = await UserCV.update(req.params.id, req.body);
      res.json({ cv: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteCV(req, res, next) {
    try {
      const cv = await UserCV.findById(req.params.id);
      if (!cv) return res.status(404).json({ error: 'CV not found.' });
      if (cv.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      await UserCV.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async exportPDF(req, res, next) {
    try {
      const cv = await UserCV.findById(req.params.id);
      if (!cv) return res.status(404).json({ error: 'CV not found.' });
      if (cv.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      const personalInfo = cv.personal_info || {};
      const experience = cv.experience || [];
      const education = cv.education || [];
      const skills = cv.skills || [];

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${cv.title}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
  h1 { color: #1a1a2e; margin-bottom: 4px; }
  h2 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 4px; margin-top: 24px; }
  .contact { color: #666; margin-bottom: 16px; }
  .entry { margin-bottom: 12px; }
  .entry-title { font-weight: bold; }
  .entry-sub { color: #555; font-size: 0.9em; }
  .skills { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill { background: #e0e7ff; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; }
  ${cv.css_content || ''}
</style>
</head>
<body>
  <h1>${personalInfo.full_name || cv.title}</h1>
  <div class="contact">
    ${personalInfo.email ? `📧 ${personalInfo.email}` : ''}
    ${personalInfo.phone ? ` &nbsp;|&nbsp; 📞 ${personalInfo.phone}` : ''}
    ${personalInfo.location ? ` &nbsp;|&nbsp; 📍 ${personalInfo.location}` : ''}
  </div>
  ${cv.summary ? `<p>${cv.summary}</p>` : ''}
  ${experience.length ? `<h2>Experience</h2>${experience.map((e) => `<div class="entry"><div class="entry-title">${e.title || ''} at ${e.company || ''}</div><div class="entry-sub">${e.duration || ''}</div><p>${e.description || ''}</p></div>`).join('')}` : ''}
  ${education.length ? `<h2>Education</h2>${education.map((e) => `<div class="entry"><div class="entry-title">${e.degree || ''}</div><div class="entry-sub">${e.institution || ''} ${e.year || ''}</div></div>`).join('')}` : ''}
  ${skills.length ? `<h2>Skills</h2><div class="skills">${skills.map((s) => `<span class="skill">${s}</span>`).join('')}</div>` : ''}
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.title.replace(/[^a-z0-9]/gi, '_')}.html"`);
      res.send(html);
    } catch (err) {
      next(err);
    }
  },

  async duplicateCV(req, res, next) {
    try {
      const original = await UserCV.findById(req.params.id);
      if (!original) return res.status(404).json({ error: 'CV not found.' });
      if (original.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden.' });
      }

      const duplicate = await UserCV.create({
        user_id: req.user.id,
        template_id: original.template_id,
        title: `${original.title} (Copy)`,
        personal_info: original.personal_info,
        education: original.education,
        experience: original.experience,
        skills: original.skills,
        languages: original.languages,
        certifications: original.certifications,
        summary: original.summary,
        parsed_data: original.parsed_data
      });
      res.status(201).json({ cv: duplicate });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = cvBuilderController;
