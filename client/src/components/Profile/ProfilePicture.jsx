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
      <div className="profile-avatar">
        {src ? (
          <img src={src} alt="Profile" />
        ) : (
          <span className="avatar-placeholder">Photo</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="resume-file-input"
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <span className="btn-spinner" /> : 'Upload photo'}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default ProfilePicture;
