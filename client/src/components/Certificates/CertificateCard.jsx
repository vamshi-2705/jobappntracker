import { useRef, useState } from 'react';
import { RiAwardLine, RiExternalLinkLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api, { getFileUrl } from '../../utils/api';
import Badge from '../UI/Badge';

const CertificateCard = ({ certificate, onEdit, onDelete, onRefresh }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('certificate', file);
    try {
      await api.post(`/certificates/${certificate.id}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Certificate file uploaded');
      onRefresh();
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const fileUrl = certificate.certificate_file
    ? getFileUrl(certificate.certificate_file)
    : null;

  return (
    <article className="cert-card">
      <RiAwardLine
        size={22}
        style={{ position: 'absolute', top: 16, right: 16, color: 'var(--accent)' }}
      />
      <div className="cert-card-header">
        <h4>{certificate.title}</h4>
        {certificate.is_expired && <Badge variant="danger">Expired</Badge>}
      </div>
      {certificate.issuer && <p className="item-sub">{certificate.issuer}</p>}
      <p className="item-meta">
        Issued:{' '}
        {certificate.issue_date
          ? new Date(certificate.issue_date).toLocaleDateString()
          : '—'}
        {certificate.expiry_date && (
          <>
            {' '}
            · Expires: {new Date(certificate.expiry_date).toLocaleDateString()}
          </>
        )}
      </p>
      {certificate.credential_id && (
        <p className="item-meta">ID: {certificate.credential_id}</p>
      )}
      <div className="cert-card-actions">
        {certificate.credential_url && (
          <a
            href={certificate.credential_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary"
          >
            <RiExternalLinkLine size={16} /> Verify
          </a>
        )}
        {fileUrl && (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
            View file
          </a>
        )}
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden-input"
          onChange={handleFile}
        />
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEdit(certificate)}>
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(certificate)}>
          Delete
        </button>
      </div>
    </article>
  );
};

export default CertificateCard;
