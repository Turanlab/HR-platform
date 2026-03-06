const AILog = require('../models/AILog');

let openaiClient = null;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
// Pricing per 1K tokens — update if OpenAI changes rates or you switch models
const PROMPT_TOKEN_COST = parseFloat(process.env.OPENAI_PROMPT_TOKEN_COST || '0.03');
const COMPLETION_TOKEN_COST = parseFloat(process.env.OPENAI_COMPLETION_TOKEN_COST || '0.06');

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function callOpenAI(prompt, userId, action, systemPrompt = 'You are an expert HR assistant.') {
  const client = getClient();
  if (!client) return null;

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  const usage = response.usage || {};
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const cost = (promptTokens / 1000) * PROMPT_TOKEN_COST + (completionTokens / 1000) * COMPLETION_TOKEN_COST;

  if (userId) {
    await AILog.create({
      user_id: userId,
      action,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      model: OPENAI_MODEL,
      cost
    }).catch(() => {});
  }

  return response.choices[0]?.message?.content || '';
}

const aiService = {
  async parseCV(text, userId) {
    const client = getClient();
    if (!client) {
      return {
        skills: ['Communication', 'Problem Solving', 'Teamwork'],
        experience: [{ title: 'Software Engineer', company: 'Example Corp', years: 2 }],
        education: [{ degree: 'B.Sc. Computer Science', institution: 'University', year: 2020 }],
        languages: ['English'],
        summary: 'Experienced professional with strong technical skills.',
        mock: true
      };
    }

    const prompt = `Extract structured information from this CV text. Return valid JSON with fields: skills (array), experience (array of {title, company, duration, description}), education (array of {degree, institution, year}), languages (array), summary (string).

CV Text:
${text.substring(0, 3000)}`;

    const result = await callOpenAI(prompt, userId, 'parse_cv');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: result };
    } catch {
      return { raw: result };
    }
  },

  async checkGrammar(text, userId) {
    const client = getClient();
    if (!client) {
      return {
        issues: [
          { type: 'grammar', original: 'Example issue', suggestion: 'Corrected version', explanation: 'Grammar improvement' }
        ],
        score: 85,
        mock: true
      };
    }

    const prompt = `Check the following text for grammar and style issues. Return JSON with: issues (array of {type, original, suggestion, explanation}), score (0-100).

Text:
${text.substring(0, 2000)}`;

    const result = await callOpenAI(prompt, userId, 'check_grammar', 'You are an expert grammar and writing coach.');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { issues: [], score: 80, raw: result };
    } catch {
      return { issues: [], score: 80, raw: result };
    }
  },

  async suggestImprovements(cvData, userId) {
    const client = getClient();
    if (!client) {
      return {
        suggestions: [
          { section: 'Summary', priority: 'high', suggestion: 'Add quantifiable achievements to your summary.' },
          { section: 'Experience', priority: 'medium', suggestion: 'Use action verbs to start each bullet point.' },
          { section: 'Skills', priority: 'low', suggestion: 'Consider grouping skills by category.' }
        ],
        overall_score: 72,
        mock: true
      };
    }

    const prompt = `Analyze this CV data and provide improvement suggestions. Return JSON with: suggestions (array of {section, priority, suggestion}), overall_score (0-100).

CV Data:
${JSON.stringify(cvData).substring(0, 2000)}`;

    const result = await callOpenAI(prompt, userId, 'suggest_improvements');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [], overall_score: 70, raw: result };
    } catch {
      return { suggestions: [], overall_score: 70, raw: result };
    }
  },

  async generateCoverLetter(cvData, jobDescription, userId) {
    const client = getClient();
    if (!client) {
      const name = cvData.personal_info?.full_name || 'Applicant';
      return {
        cover_letter: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position described in your job posting. With my background in ${(cvData.skills || []).slice(0, 3).join(', ')}, I am confident I would be a valuable addition to your team.\n\nMy experience has prepared me well for this role. I am particularly excited about this opportunity because it aligns perfectly with my career goals and skill set.\n\nThank you for considering my application. I look forward to discussing how I can contribute to your team.\n\nSincerely,\n${name}`,
        mock: true
      };
    }

    const prompt = `Write a professional cover letter based on the following CV data and job description. Return JSON with: cover_letter (string).

CV Data: ${JSON.stringify(cvData).substring(0, 1500)}
Job Description: ${jobDescription.substring(0, 1000)}`;

    const result = await callOpenAI(prompt, userId, 'generate_cover_letter');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { cover_letter: result };
    } catch {
      return { cover_letter: result };
    }
  },

  async extractSkills(text, userId) {
    const client = getClient();
    if (!client) {
      return {
        technical_skills: ['JavaScript', 'Python', 'SQL', 'React'],
        soft_skills: ['Leadership', 'Communication', 'Problem Solving'],
        all_skills: ['JavaScript', 'Python', 'SQL', 'React', 'Leadership', 'Communication', 'Problem Solving'],
        mock: true
      };
    }

    const prompt = `Extract all skills from the following text. Return JSON with: technical_skills (array), soft_skills (array), all_skills (combined array).

Text:
${text.substring(0, 2000)}`;

    const result = await callOpenAI(prompt, userId, 'extract_skills');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { all_skills: [], technical_skills: [], soft_skills: [] };
    } catch {
      return { all_skills: [], technical_skills: [], soft_skills: [] };
    }
  },

  async calculateAtsScore(cvData, jobDescription, userId) {
    const client = getClient();
    if (!client) {
      const skills = Array.isArray(cvData.skills) ? cvData.skills : [];
      const score = Math.min(95, 50 + skills.length * 3);
      return {
        score,
        keyword_matches: skills.slice(0, 5),
        missing_keywords: ['Leadership', 'Agile', 'Cloud'],
        recommendations: [
          'Include more keywords from the job description.',
          'Add a professional summary section.',
          'Quantify your achievements with numbers.'
        ],
        mock: true
      };
    }

    const prompt = `Calculate an ATS (Applicant Tracking System) compatibility score for this CV against the job description. Return JSON with: score (0-100), keyword_matches (array), missing_keywords (array), recommendations (array of strings).

CV Data: ${JSON.stringify(cvData).substring(0, 1500)}
Job Description: ${jobDescription.substring(0, 1000)}`;

    const result = await callOpenAI(prompt, userId, 'calculate_ats_score');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, keyword_matches: [], missing_keywords: [], recommendations: [] };
    } catch {
      return { score: 50, keyword_matches: [], missing_keywords: [], recommendations: [] };
    }
  },

  async matchCandidateToJob(cvData, jobDescription, userId) {
    const client = getClient();
    if (!client) {
      return {
        match_score: 74,
        strengths: ['Relevant technical skills', 'Required experience level'],
        gaps: ['Missing certification mentioned in JD'],
        recommendation: 'Good match. Consider highlighting relevant projects.',
        mock: true
      };
    }

    const prompt = `Evaluate how well this candidate's CV matches the job description. Return JSON with: match_score (0-100), strengths (array), gaps (array), recommendation (string).

CV Data: ${JSON.stringify(cvData).substring(0, 1500)}
Job Description: ${jobDescription.substring(0, 1000)}`;

    const result = await callOpenAI(prompt, userId, 'match_candidate_to_job');
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { match_score: 0, strengths: [], gaps: [], recommendation: '' };
    } catch {
      return { match_score: 0, strengths: [], gaps: [], recommendation: '' };
    }
  }
};

module.exports = aiService;
