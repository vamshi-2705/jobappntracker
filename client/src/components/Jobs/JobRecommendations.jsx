import { useState } from 'react';
import api from '../../utils/api';

const JobRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);
    try {
      const { data } = await api.post('/recommend/jobs');
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section-card">
      <div className="section-title-row">
        <h3>Job recommendations</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Suggest roles'}
        </button>
      </div>
      <p className="ai-hint">Groq AI suggests roles based on your skills profile.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="recommend-list">
        {recommendations.map((rec, i) => (
          <article key={i} className="recommend-card">
            <h4>{rec.jobTitle}</h4>
            <p>{rec.whyItMatches}</p>
            {rec.averageSalary && <p className="item-meta">Avg. salary: {rec.averageSalary}</p>}
            {rec.skillsToImprove?.length > 0 && (
              <>
                <p className="item-meta">Skills to improve:</p>
                <ul>
                  {rec.skillsToImprove.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default JobRecommendations;
