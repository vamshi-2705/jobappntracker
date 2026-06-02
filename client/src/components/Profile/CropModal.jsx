import { useState } from 'react';
import { RiRotateLockLine, RiZoomInLine } from 'react-icons/ri';

const CropModal = ({ imageSrc, onConfirm, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleRotateLeft = () => setRotation((r) => r - 90);
  const handleRotateRight = () => setRotation((r) => r + 90);

  const handleConfirm = () => {
    // Create a canvas to apply the transform and export as blob
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const dim = Math.min(img.width, img.height);
      const sx = (img.width - dim) / 2;
      const sy = (img.height - dim) / 2;
      ctx.drawImage(img, sx, sy, dim, dim, -size / 2, -size / 2, size, size);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          onConfirm(file);
        }
      }, 'image/jpeg', 0.92);
    };
    img.src = imageSrc;
  };

  return (
    <div className="crop-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="crop-modal">
        <h3 style={{ margin: '0 0 16px', color: '#f9fafb', fontSize: '1rem', fontWeight: 600 }}>
          Adjust Photo
        </h3>

        <div className="crop-preview">
          <img
            src={imageSrc}
            alt="Preview"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transition: 'transform 0.15s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transformOrigin: 'center',
            }}
          />
        </div>

        <div className="crop-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiZoomInLine size={16} color="#9ca3af" />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: 40 }}>Zoom</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: 32, textAlign: 'right' }}>
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiRotateLockLine size={16} color="#9ca3af" />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: 40 }}>Rotate</span>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <button
                type="button"
                onClick={handleRotateLeft}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: 8,
                  color: '#d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#4b5563')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#374151')}
              >
                ↺ Left
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                style={{
                  flex: 1,
                  padding: '7px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: 8,
                  color: '#d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#4b5563')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#374151')}
              >
                ↻ Right
              </button>
            </div>
          </div>

          <div className="crop-buttons">
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 18px',
                background: 'transparent',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = '#f9fafb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: '8px 18px',
                background: '#6366f1',
                border: '1px solid #6366f1',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
