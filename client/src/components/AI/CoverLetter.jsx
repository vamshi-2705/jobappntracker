import { useEffect, useState } from 'react';
import api from '../../utils/api';
import ResumeUpload from './ResumeUpload';

const CoverLetter = ({ selectedJob, resume, onResumeChange }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    setJobDescription(selectedJob?.job_description || '');
    setCompany(selectedJob?.company || '');
    setPosition(selectedJob?.position || '');
  }, [selectedJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCoverLetter('');
    try {
      const { data } = await api.post('/ai/coverletter', {
        resume: resume || undefined,
        jobDescription,
        company,
        position,
        jobId: selectedJob?.id,
      });
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  return (
    <div className="ai-panel">
      <h3>Cover letter generator</h3>
      <p className="ai-hint">Upload your resume for a personalized cover letter.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="cl-company">Company</label>
            <input
              id="cl-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div>
            <label htmlFor="cl-position">Position</label>
            <input
              id="cl-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job title"
            />
          </div>
        </div>
        <ResumeUpload resume={resume} onResumeChange={onResumeChange} />
        <label htmlFor="cl-jd">Job description *</label>
        <textarea
          id="cl-jd"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
          required
        />
        {error && <div className="alert alert-error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Generate cover letter'}
        </button>
      </form>
      {coverLetter && (
        <div className="ai-result">
          <div className="result-header">
            <h4>Your cover letter</h4>
            <button type="button" className="btn btn-sm btn-secondary" onClick={copyToClipboard}>
              Copy
            </button>
          </div>
          <pre className="letter-output">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
};

export default CoverLetter;
