import { useState } from 'react';
import api from '../../utils/api';

const emptyEdu = {
  institution: '',
  degree: '',
  field_of_study: '',
  start_year: '',
  end_year: '',
  grade: '',
  description: '',
};

const EducationSection = ({ items, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEdu);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyEdu);
    setShowForm(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      institution: item.institution || '',
      degree: item.degree || '',
      field_of_study: item.field_of_study || '',
      start_year: item.start_year || '',
      end_year: item.end_year || '',
      grade: item.grade || '',
      description: item.description || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      start_year: form.start_year ? Number(form.start_year) : null,
      end_year: form.end_year ? Number(form.end_year) : null,
    };
    try {
      if (editing) {
        await api.put(`/profile/education/${editing.id}`, payload);
      } else {
        await api.post('/profile/education', payload);
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await api.delete(`/profile/education/${id}`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="profile-section-card">
      <div className="section-title-row">
        <h3>Education</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={openAdd}>
          + Add
        </button>
      </div>
      {error && !showForm && <div className="alert alert-error">{error}</div>}
      {!items.length && <p className="empty-inline">No education added yet.</p>}
      <div className="profile-item-list">
        {items.map((item) => (
          <article key={item.id} className="profile-item">
            <div>
              <h4>{item.degree}</h4>
              <p className="item-sub">{item.institution}</p>
              {item.field_of_study && <p className="item-meta">{item.field_of_study}</p>}
              <p className="item-meta">
                {item.start_year || '—'} – {item.end_year || 'Present'}
                {item.grade ? ` · ${item.grade}` : ''}
              </p>
              {item.description && <p className="item-desc">{item.description}</p>}
            </div>
            <div className="item-actions">
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>
                Edit
              </button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {showForm && (
        <div className="inline-form">
          <h4>{editing ? 'Edit education' : 'Add education'}</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Institution *</label>
                <input name="institution" value={form.institution} onChange={handleChange} required />
              </div>
              <div>
                <label>Degree *</label>
                <input name="degree" value={form.degree} onChange={handleChange} required />
              </div>
              <div>
                <label>Field of study</label>
                <input name="field_of_study" value={form.field_of_study} onChange={handleChange} />
              </div>
              <div>
                <label>Grade</label>
                <input name="grade" value={form.grade} onChange={handleChange} />
              </div>
              <div>
                <label>Start year</label>
                <input name="start_year" type="number" value={form.start_year} onChange={handleChange} />
              </div>
              <div>
                <label>End year</label>
                <input name="end_year" type="number" value={form.end_year} onChange={handleChange} />
              </div>
            </div>
            <label>Description</label>
            <textarea name="description" rows={2} value={form.description} onChange={handleChange} />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EducationSection;
