import { useState, useRef, useEffect } from 'react';
import { RiCameraLine, RiDeleteBin6Line, RiUpload2Line } from 'react-icons/ri';
import api, { getFileUrl } from '../../utils/api';
import CropModal from './CropModal';

const PhotoUpload = ({ pictureUrl, onUploaded }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImgSrc, setSelectedImgSrc] = useState(null);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDropdownOpen(false);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImgSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedFile) => {
    setSelectedImgSrc(null);
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('picture', croppedFile);

    try {
      const { data } = await api.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.removeItem('profile_picture_removed');
      onUploaded(data);
      window.dispatchEvent(new Event('profile-picture-changed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setDropdownOpen(false);
    localStorage.setItem('profile_picture_removed', 'true');
    onUploaded({ profilePicture: null });
    window.dispatchEvent(new Event('profile-picture-changed'));
  };

  const handleCircleClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const src = (pictureUrl && localStorage.getItem('profile_picture_removed') !== 'true')
    ? getFileUrl(pictureUrl)
    : null;

  return (
    <div className="photo-container" ref={dropdownRef}>
      {/* Circle area */}
      <div className="photo-circle-wrapper" onClick={handleCircleClick}>
        {src ? (
          <img src={src} className="photo-circle" alt="Profile" />
        ) : (
          <div className="photo-circle" style={{ background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '2.5rem', fontWeight: 'bold' }}>
            ?
          </div>
        )}
        <div className="photo-overlay">
          <RiCameraLine size={24} />
          <span>Change Photo</span>
        </div>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="photo-menu">
          <div className="photo-menu-item" onClick={() => { setDropdownOpen(false); fileInputRef.current?.click(); }}>
            <RiUpload2Line size={16} />
            Upload new photo
          </div>
          {src && (
            <div className="photo-menu-item danger" onClick={handleRemovePhoto}>
              <RiDeleteBin6Line size={16} />
              Remove photo
            </div>
          )}
        </div>
      )}

      {/* Crop Modal */}
      {selectedImgSrc && (
        <CropModal
          imageSrc={selectedImgSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setSelectedImgSrc(null)}
        />
      )}

      {error && <p className="field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>{error}</p>}
      {uploading && <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>Uploading...</p>}
    </div>
  );
};

export default PhotoUpload;
