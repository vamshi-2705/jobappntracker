const { query } = require('../config/db');
const { refreshCompletionPercent } = require('./profileController');
const { groq, AI_MODEL, getGroqApiKey } = require('../config/ai');

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const profileCompletion = await refreshCompletionPercent(userId);

    const skillsCount = await query(
      'SELECT COUNT(*)::int AS c FROM skills WHERE user_id = $1',
      [userId]
    );
    const certsCount = await query(
      `SELECT
         (SELECT COUNT(*) FROM certificates WHERE user_id = $1) +
         (SELECT COUNT(*) FROM achievements WHERE user_id = $1) +
         (SELECT COUNT(*) FROM courses WHERE user_id = $1) AS c`,
      [userId]
    );
    const jobsCount = await query(
      'SELECT COUNT(*)::int AS c FROM jobs WHERE user_id = $1',
      [userId]
    );

    const activityResult = await query(
      `SELECT type, message, created_at FROM (
         SELECT 'job' AS type,
           ('Added application: ' || position || ' at ' || company) AS message,
           created_at
         FROM jobs WHERE user_id = $1
         UNION ALL
         SELECT 'skill' AS type,
           ('Added skill: ' || name) AS message,
           created_at
         FROM skills WHERE user_id = $1
         UNION ALL
         SELECT 'certificate' AS type,
           ('Added certificate: ' || title) AS message,
           created_at
         FROM certificates WHERE user_id = $1
         UNION ALL
         SELECT 'achievement' AS type,
           ('Added achievement: ' || title) AS message,
           created_at
         FROM achievements WHERE user_id = $1
         UNION ALL
         SELECT 'course' AS type,
           ('Completed course: ' || title) AS message,
           created_at
         FROM courses WHERE user_id = $1
       ) AS activity
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    let tipOfTheDay =
      'Tailor your resume keywords to each job description for better ATS scores.';

    if (getGroqApiKey()) {
      try {
        const completion = await groq.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.8,
          max_tokens: 80,
          messages: [
            {
              role: 'system',
              content:
                'Give one short motivational tip (one sentence only) for a job seeker. No quotes.',
            },
            { role: 'user', content: 'Tip of the day please.' },
          ],
        });
        tipOfTheDay = completion.choices[0].message.content?.trim() || tipOfTheDay;
      } catch (err) {
        console.error('Tip generation skipped:', err.message);
      }
    }

    res.status(200).json({
      profileCompletion,
      totalSkills: skillsCount.rows[0].c,
      totalCertificates: certsCount.rows[0].c,
      totalJobs: jobsCount.rows[0].c,
      recentActivity: activityResult.rows,
      tipOfTheDay,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error.message);
    res.status(500).json({ message: 'Failed to load dashboard summary' });
  }
};

module.exports = { getDashboardSummary };
