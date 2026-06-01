import { useRef, useState } from 'react';
import api, { getFileUrl } from '../../utils/api';

const ProfileResumeUpload = ({ resumeUrl, onUploaded }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const viewUrl = resumeUrl ? getFileUrl(resumeUrl) : null;

  return (
    <div className="profile-resume-block">
      <label>Resume (PDF)</label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="resume-file-input"
        onChange={handleChange}
      />
      <div className="resume-upload-row">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <span className="btn-spinner" /> : 'Upload PDF resume'}
        </button>
        {viewUrl && (
          <a href={viewUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
            View resume
          </a>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default ProfileResumeUpload;
