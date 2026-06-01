import { useEffect, useState } from 'react';
import api from '../utils/api';
import TopicSelector from '../components/Interview/TopicSelector';
import QuestionCard from '../components/Interview/QuestionCard';
import MockInterview from '../components/Interview/MockInterview';

const FAVORITES_KEY = 'interview_favorites';

const InterviewPrepPage = () => {
  const [topic, setTopic] = useState('DSA');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [mockMode, setMockMode] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
    } catch {
      setFavorites([]);
    }
  }, []);

  const saveFavorites = (list) => {
    setFavorites(list);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    setMockMode(false);
    try {
      const { data } = await api.post('/ai/interview-prep', {
        topic,
        resume: resume || undefined,
      });
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (item) => {
    const key = item.question;
    if (favorites.some((f) => f.question === key)) return;
    saveFavorites([...favorites, { ...item, topic }]);
  };

  return (
    <div className="dashboard">
      <div className="profile-section-card">
        <TopicSelector value={topic} onChange={setTopic} />
        <label style={{ marginTop: '1rem' }}>Resume context (optional)</label>
        <textarea
          rows={3}
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste resume for tailored questions..."
        />
        {error && <div className="alert alert-error">{error}</div>}
        <div className="cert-card-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Generate 10 questions'}
          </button>
          {questions.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setMockMode(true)}>
              Start mock interview
            </button>
          )}
        </div>
      </div>

      {mockMode && (
        <MockInterview questions={questions} onExit={() => setMockMode(false)} />
      )}

      {!mockMode && questions.length > 0 && (
        <div className="question-list">
          {questions.map((q, i) => (
            <QuestionCard key={i} item={q} index={i} onFavorite={handleFavorite} />
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="profile-section-card" style={{ marginTop: '1.5rem' }}>
          <h3>Saved favorites</h3>
          <ul className="activity-list">
            {favorites.map((f, i) => (
              <li key={i}>
                <strong>[{f.topic}]</strong> {f.question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPage;
