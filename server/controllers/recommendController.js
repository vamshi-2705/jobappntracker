const { query } = require('../config/db');
const { groq, AI_MODEL, ensureAiConfigured, sendAiError } = require('../config/ai');

const parseJsonFromContent = (content) => {
  const jsonMatch = content.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');
  return JSON.parse(jsonMatch[0]);
};

const recommendJobs = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const skillsResult = await query(
      'SELECT name, category, proficiency, years_of_experience FROM skills WHERE user_id = $1',
      [req.user.id]
    );

    if (skillsResult.rows.length === 0) {
      return res.status(400).json({
        message: 'Add skills to your profile first to get job recommendations',
      });
    }

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Suggest 5 job roles matching the candidate skills. Respond ONLY with JSON: {"recommendations": [{"jobTitle": string, "whyItMatches": string, "skillsToImprove": string[], "averageSalary": string}]}',
        },
        {
          role: 'user',
          content: `Skills:\n${JSON.stringify(skillsResult.rows, null, 2)}`,
        },
      ],
    });

    const parsed = parseJsonFromContent(completion.choices[0].message.content);
    const recommendations = (parsed.recommendations || []).slice(0, 5);

    res.status(200).json({ recommendations });
  } catch (error) {
    return sendAiError(res, error, 'Failed to generate job recommendations');
  }
};

module.exports = { recommendJobs };
