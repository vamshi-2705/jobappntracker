import { useEffect, useState } from 'react';

const empty = {
  title: '',
  issuer: '',
  issue_date: '',
  expiry_date: '',
  credential_id: '',
  credential_url: '',
};

const CertificateForm = ({ certificate, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (certificate) {
      setForm({
        title: certificate.title || '',
        issuer: certificate.issuer || '',
        issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
        expiry_date: certificate.expiry_date ? certificate.expiry_date.split('T')[0] : '',
        credential_id: certificate.credential_id || '',
        credential_url: certificate.credential_url || '',
      });
    } else {
      setForm(empty);
    }
  }, [certificate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="inline-form cert-form" onSubmit={handleSubmit}>
      <h4>{certificate ? 'Edit certificate' : 'Add certificate'}</h4>
      <div className="form-grid">
        <div className="form-grid-full">
          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Issuer</label>
          <input name="issuer" value={form.issuer} onChange={handleChange} />
        </div>
        <div>
          <label>Credential ID</label>
          <input name="credential_id" value={form.credential_id} onChange={handleChange} />
        </div>
        <div>
          <label>Issue date</label>
          <input name="issue_date" type="date" value={form.issue_date} onChange={handleChange} />
        </div>
        <div>
          <label>Expiry date</label>
          <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} />
        </div>
        <div className="form-grid-full">
          <label>Credential URL</label>
          <input
            name="credential_url"
            type="url"
            value={form.credential_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;
