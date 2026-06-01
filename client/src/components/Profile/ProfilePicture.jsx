import { useRef, useState } from 'react';
import api, { getFileUrl } from '../../utils/api';

const ProfilePicture = ({ pictureUrl, onUploaded }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('picture', file);

    try {
      const { data } = await api.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const src = pictureUrl ? getFileUrl(pictureUrl) : null;

  return (
    <div className="profile-picture-block">
      <button
        type="button"
        className="profile-upload-area"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={src ? 'Change profile photo' : 'Upload profile photo'}
      >
        {src ? (
          <img src={src} alt="Profile" className="profile-upload-preview" />
        ) : (
          <>
            <svg
              className="profile-upload-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{uploading ? 'Uploading…' : 'Click to upload photo'}</span>
            <span className="profile-upload-hint">JPG, PNG or WEBP</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden-input"
        onChange={handleChange}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default ProfilePicture;
