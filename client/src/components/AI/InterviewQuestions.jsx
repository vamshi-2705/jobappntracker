import { useEffect, useState } from 'react';
import api from '../../utils/api';
import ResumeUpload from './ResumeUpload';

const InterviewQuestions = ({ selectedJob, resume, onResumeChange }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setJobDescription(selectedJob?.job_description || '');
  }, [selectedJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const { data } = await api.post('/ai/questions', {
        jobDescription,
        resume: resume || undefined,
        jobId: selectedJob?.id,
      });
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3>Interview questions</h3>
      <p className="ai-hint">Upload your resume (optional) for tailored questions.</p>
      <form onSubmit={handleSubmit}>
        <ResumeUpload resume={resume} onResumeChange={onResumeChange} />
        <label htmlFor="iq-jd">Job description *</label>
        <textarea
          id="iq-jd"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
          required
        />
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Generate questions'}
        </button>
      </form>
      {questions.length > 0 && (
        <div className="ai-result">
          <h4>Likely interview questions</h4>
          <ol className="questions-list">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;
