const { query } = require('../config/db');
const { groq, AI_MODEL, ensureAiConfigured, sendAiError } = require('../config/ai');

const STYLES = ['Modern', 'Classic', 'Minimal'];

const gatherProfileData = async (userId) => {
  const user = await query('SELECT name, email FROM users WHERE id = $1', [userId]);
  const profile = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  const education = await query('SELECT * FROM education WHERE user_id = $1', [userId]);
  const experience = await query('SELECT * FROM experience WHERE user_id = $1', [userId]);
  const projects = await query('SELECT * FROM projects WHERE user_id = $1', [userId]);
  const skills = await query('SELECT * FROM skills WHERE user_id = $1', [userId]);
  const certificates = await query('SELECT * FROM certificates WHERE user_id = $1', [userId]);

  return {
    user: user.rows[0],
    profile: profile.rows[0] || null,
    education: education.rows,
    experience: experience.rows,
    projects: projects.rows,
    skills: skills.rows,
    certificates: certificates.rows,
  };
};

const generateResume = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const { style = 'Modern' } = req.body;
    if (!STYLES.includes(style)) {
      return res.status(400).json({
        message: `Style must be one of: ${STYLES.join(', ')}`,
      });
    }

    const data = await gatherProfileData(req.user.id);
    const payload = JSON.stringify(data, null, 2);

    const styleGuide = {
      Modern: 'clean sections, strong action verbs, concise bullet points',
      Classic: 'traditional formal tone, full sentences, professional structure',
      Minimal: 'very concise, whitespace-friendly, essential information only',
    };

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer. Create an ATS-friendly resume in plain text using ${style} style (${styleGuide[style]}). Use clear section headers (SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS). Only include facts from the provided data. Return only the resume text.`,
        },
        {
          role: 'user',
          content: `Candidate data JSON:\n${payload}`,
        },
      ],
    });

    const resumeText = completion.choices[0].message.content?.trim() || '';

    res.status(200).json({ resume: resumeText, style });
  } catch (error) {
    return sendAiError(res, error, 'Failed to generate resume');
  }
};

module.exports = { generateResume, STYLES };
