import { useEffect, useState } from 'react';
import api from '../../utils/api';
import ResumeUpload from './ResumeUpload';

const ResumeMatch = ({ selectedJob, resume, onResumeChange }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setJobDescription(selectedJob?.job_description || '');
  }, [selectedJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume?.trim()) {
      setError('Please upload your resume first');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/ai/match', {
        resume,
        jobDescription,
        jobId: selectedJob?.id,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3>Resume match scorer</h3>
      <p className="ai-hint">Upload your resume and compare it to the job description.</p>
      <form onSubmit={handleSubmit}>
        <ResumeUpload
          resume={resume}
          onResumeChange={onResumeChange}
          required
        />
        <label htmlFor="match-jd">Job description</label>
        <textarea
          id="match-jd"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
          required
        />
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Analyze match'}
        </button>
      </form>
      {result && (
        <div className="ai-result">
          <div className="match-score">
            <span className="score-value">{result.matchScore}</span>
            <span className="score-label">/ 100</span>
          </div>
          {result.summary && <p>{result.summary}</p>}
          {result.strengths?.length > 0 && (
            <>
              <h4>Strengths</h4>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
          {result.gaps?.length > 0 && (
            <>
              <h4>Gaps</h4>
              <ul>
                {result.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </>
          )}
          {result.improvementTips?.length > 0 && (
            <>
              <h4>Improvement tips</h4>
              <ul>
                {result.improvementTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeMatch;
