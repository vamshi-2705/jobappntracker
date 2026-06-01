const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const { query } = require('../config/db');
const { groq, AI_MODEL, ensureAiConfigured, sendAiError } = require('../config/ai');

const verifyJobOwnership = async (jobId, userId) => {
  const result = await query(
    'SELECT id FROM jobs WHERE id = $1 AND user_id = $2',
    [jobId, userId]
  );
  return result.rows.length > 0;
};

const saveAiResult = async (jobId, fields) => {
  const { match_score, cover_letter, interview_questions } = fields;

  const existing = await query(
    'SELECT id FROM ai_results WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1',
    [jobId]
  );

  if (existing.rows.length > 0) {
    await query(
      `UPDATE ai_results SET
         match_score = COALESCE($1, match_score),
         cover_letter = COALESCE($2, cover_letter),
         interview_questions = COALESCE($3, interview_questions)
       WHERE id = $4`,
      [
        match_score ?? null,
        cover_letter ?? null,
        interview_questions ?? null,
        existing.rows[0].id,
      ]
    );
  } else {
    await query(
      `INSERT INTO ai_results (job_id, match_score, cover_letter, interview_questions)
       VALUES ($1, $2, $3, $4)`,
      [jobId, match_score ?? null, cover_letter ?? null, interview_questions ?? null]
    );
  }
};

const parseJsonFromContent = (content) => {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }
  return JSON.parse(jsonMatch[0]);
};

const resumeMatch = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const { resume, jobDescription, jobId } = req.body;

    if (!resume || !String(resume).trim()) {
      return res.status(400).json({ message: 'Resume text is required' });
    }
    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    if (jobId) {
      const owned = await verifyJobOwnership(jobId, req.user.id);
      if (!owned) {
        return res.status(404).json({ message: 'Job not found' });
      }
    }

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career coach. Compare a resume to a job description. Respond ONLY with valid JSON: {"matchScore": number 0-100, "summary": string, "strengths": string[], "gaps": string[], "improvementTips": string[]}',
        },
        {
          role: 'user',
          content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
    });

    const parsed = parseJsonFromContent(completion.choices[0].message.content);
    const matchScore = Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0)));

    if (jobId) {
      await saveAiResult(jobId, { match_score: matchScore });
    }

    res.status(200).json({
      matchScore,
      summary: parsed.summary || '',
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || [],
      improvementTips: parsed.improvementTips || [],
    });
  } catch (error) {
    return sendAiError(res, error, 'Failed to analyze resume match');
  }
};

const coverLetter = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const { resume, jobDescription, company, position, jobId } = req.body;

    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    if (jobId) {
      const owned = await verifyJobOwnership(jobId, req.user.id);
      if (!owned) {
        return res.status(404).json({ message: 'Job not found' });
      }
    }

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career writer. Write a professional, personalized cover letter (3-4 paragraphs). Use a confident but natural tone. Do not invent credentials not supported by the resume. Return only the cover letter text, no markdown headings.',
        },
        {
          role: 'user',
          content: `Company: ${company || 'the company'}
Position: ${position || 'the role'}
${resume ? `Candidate resume:\n${resume}\n\n` : ''}Job description:\n${jobDescription}`,
        },
      ],
    });

    const letter = completion.choices[0].message.content?.trim() || '';

    if (jobId) {
      await saveAiResult(jobId, { cover_letter: letter });
    }

    res.status(200).json({ coverLetter: letter });
  } catch (error) {
    return sendAiError(res, error, 'Failed to generate cover letter');
  }
};

const interviewQuestions = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const { jobDescription, resume, jobId } = req.body;

    if (!jobDescription || !String(jobDescription).trim()) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    if (jobId) {
      const owned = await verifyJobOwnership(jobId, req.user.id);
      if (!owned) {
        return res.status(404).json({ message: 'Job not found' });
      }
    }

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a hiring manager. Generate exactly 10 likely interview questions for this role. Respond ONLY with JSON: {"questions": string[]}',
        },
        {
          role: 'user',
          content: `${resume ? `Candidate background:\n${resume}\n\n` : ''}Job description:\n${jobDescription}`,
        },
      ],
    });

    const parsed = parseJsonFromContent(completion.choices[0].message.content);
    const questions = (parsed.questions || []).slice(0, 10);

    const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

    if (jobId) {
      await saveAiResult(jobId, { interview_questions: questionsText });
    }

    res.status(200).json({ questions });
  } catch (error) {
    return sendAiError(res, error, 'Failed to generate interview questions');
  }
};

const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a resume file to upload' });
    }

    const { buffer, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === '.txt') {
      text = buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        message: 'Unsupported file type. Upload PDF, DOCX, or TXT.',
      });
    }

    text = text.replace(/\s+/g, ' ').trim();

    if (!text || text.length < 20) {
      return res.status(400).json({
        message: 'Could not read enough text from the file. Try a different format or paste text manually.',
      });
    }

    res.status(200).json({
      text,
      fileName: originalname,
      characterCount: text.length,
    });
  } catch (error) {
    console.error('Parse resume error:', error.message);
    res.status(500).json({ message: 'Failed to read resume file' });
  }
};

const INTERVIEW_TOPICS = [
  'DSA',
  'System Design',
  'React',
  'Node.js',
  'PostgreSQL',
  'HR Questions',
  'Behavioral',
];

const interviewPrep = async (req, res) => {
  try {
    if (!ensureAiConfigured(res)) return;

    const { topic, resume } = req.body;

    if (!topic || !INTERVIEW_TOPICS.includes(topic)) {
      return res.status(400).json({
        message: `Topic must be one of: ${INTERVIEW_TOPICS.join(', ')}`,
      });
    }

    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert interviewer for ${topic}. Generate exactly 10 interview questions with strong sample answers. Respond ONLY with JSON: {"questions": [{"question": string, "answer": string}]}`,
        },
        {
          role: 'user',
          content: `${resume ? `Candidate background:\n${resume}\n\n` : ''}Generate ${topic} interview prep questions.`,
        },
      ],
    });

    const parsed = parseJsonFromContent(completion.choices[0].message.content);
    const questions = (parsed.questions || []).slice(0, 10);

    res.status(200).json({ topic, questions });
  } catch (error) {
    return sendAiError(res, error, 'Failed to generate interview prep');
  }
};

module.exports = {
  resumeMatch,
  coverLetter,
  interviewQuestions,
  parseResume,
  interviewPrep,
  INTERVIEW_TOPICS,
};
