import { useRef, useState } from 'react';
import api from '../../utils/api';
import ResumePreview from './ResumePreview';

const STYLES = ['Modern', 'Classic', 'Minimal'];

const ResumeBuilder = () => {
  const [style, setStyle] = useState('Modern');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResume('');
    try {
      const { data } = await api.post('/resume/generate', { style });
      setResume(data.resume);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Resume</title>
      <style>body{font-family:Georgia,serif;padding:40px;line-height:1.5;white-space:pre-wrap;}</style>
      </head><body>${resume.replace(/</g, '&lt;')}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="skills-toolbar profile-section-card">
        <div>
          <label htmlFor="resume-style">Resume style</label>
          <select id="resume-style" value={style} onChange={(e) => setStyle(e.target.value)}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Generate resume'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {resume && (
        <div className="profile-section-card">
          <div className="result-header">
            <h3>Preview</h3>
            <div className="cert-card-actions">
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={handleDownloadPdf}>
                Download PDF
              </button>
            </div>
          </div>
          <ResumePreview resume={resume} previewRef={previewRef} />
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
