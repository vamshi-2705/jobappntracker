const OpenAI = require('openai');

const getGroqApiKey = () =>
  process.env.GROQ_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || '';

const groq = new OpenAI({
  apiKey: getGroqApiKey(),
  baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
});

const AI_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const ensureAiConfigured = (res) => {
  if (!getGroqApiKey()) {
    res.status(500).json({
      message: 'Groq API key is missing. Add GROQ_API_KEY to server/.env',
    });
    return false;
  }
  return true;
};

const sendAiError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error.message);
  const status = error.status || error.response?.status;
  const code = error.code || error.error?.code;

  if (status === 401) {
    return res.status(500).json({
      message: 'Invalid Groq API key. Check GROQ_API_KEY in server/.env',
    });
  }
  if (status === 429 || code === 'insufficient_quota' || code === 'rate_limit_exceeded') {
    return res.status(429).json({
      message:
        'Groq rate limit reached. Wait a moment or check usage at https://console.groq.com',
    });
  }
  return res.status(500).json({ message: fallbackMessage });
};

module.exports = { groq, AI_MODEL, ensureAiConfigured, sendAiError, getGroqApiKey };
