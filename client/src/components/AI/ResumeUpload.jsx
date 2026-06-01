import { useRef, useState } from 'react';
import api from '../../utils/api';

const ACCEPT = '.pdf,.docx,.txt';
const FILE_OPTIONS = [
  { value: '', label: 'Choose file type to upload…' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'docx', label: 'Word (.docx)' },
  { value: 'txt', label: 'Text (.txt)' },
];

const ResumeUpload = ({
  resume,
  onResumeChange,
  required = false,
  showPreview = true,
}) => {
  const fileInputRef = useRef(null);
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [showText, setShowText] = useState(false);

  const acceptMap = {
    pdf: '.pdf',
    docx: '.docx',
    txt: '.txt',
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFileType(type);
    setError('');
    if (type && fileInputRef.current) {
      fileInputRef.current.accept = acceptMap[type];
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError('');
    setFileName(file.name);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/ai/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onResumeChange(data.text);
      setShowText(false);
    } catch (err) {
      setFileName('');
      setError(err.response?.data?.message || 'Failed to read resume file');
      onResumeChange('');
    } finally {
      setParsing(false);
      e.target.value = '';
      setFileType('');
    }
  };

  const handleClear = () => {
    setFileName('');
    setFileType('');
    setError('');
    onResumeChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="resume-upload">
      <label htmlFor="resume-file-type">
        Upload resume {required && '*'}
      </label>
      <div className="resume-upload-row">
        <select
          id="resume-file-type"
          className="resume-type-select"
          value={fileType}
          onChange={handleTypeChange}
          disabled={parsing}
        >
          {FILE_OPTIONS.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
        >
          {parsing ? <span className="btn-spinner" /> : 'Browse file'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="resume-file-input"
          accept={fileType ? acceptMap[fileType] : ACCEPT}
          onChange={handleFileChange}
          tabIndex={-1}
          aria-hidden
        />
      </div>
      <p className="resume-upload-hint">PDF, DOCX, or TXT — max 5MB</p>

      {fileName && !parsing && (
        <div className="resume-file-badge">
          <span>Loaded: {fileName}</span>
          <button type="button" className="link-btn" onClick={handleClear}>
            Remove
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {resume && showPreview && (
        <div className="resume-preview">
          <button
            type="button"
            className="link-btn preview-toggle"
            onClick={() => setShowText((v) => !v)}
          >
            {showText ? 'Hide' : 'View'} extracted text
          </button>
          {showText && (
            <textarea
              rows={5}
              value={resume}
              onChange={(e) => onResumeChange(e.target.value)}
              className="resume-preview-text"
              aria-label="Extracted resume text"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
