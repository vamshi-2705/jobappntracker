import { useState } from 'react';
import api from '../../utils/api';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Other'];

const emptyExp = {
  company: '',
  role: '',
  employment_type: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
};

const ExperienceSection = ({ items, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyExp);
    setShowForm(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company || '',
      role: item.role || '',
      employment_type: item.employment_type || '',
      location: item.location || '',
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      is_current: Boolean(item.is_current),
      description: item.description || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/profile/experience/${editing.id}`, form);
      } else {
        await api.post('/profile/experience', form);
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await api.delete(`/profile/experience/${id}`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="profile-section-card">
      <div className="section-title-row">
        <h3>Experience</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={openAdd}>
          + Add
        </button>
      </div>
      {error && !showForm && <div className="alert alert-error">{error}</div>}
      {!items.length && <p className="empty-inline">No experience added yet.</p>}
      <div className="profile-item-list">
        {items.map((item) => (
          <article key={item.id} className="profile-item">
            <div>
              <h4>
                {item.role}
                {item.is_current && <span className="badge badge-offered">Current</span>}
              </h4>
              <p className="item-sub">{item.company}</p>
              <p className="item-meta">
                {[item.employment_type, item.location].filter(Boolean).join(' · ')}
              </p>
              <p className="item-meta">
                {item.start_date ? new Date(item.start_date).toLocaleDateString() : '—'} –{' '}
                {item.is_current ? 'Present' : item.end_date ? new Date(item.end_date).toLocaleDateString() : '—'}
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
          <h4>{editing ? 'Edit experience' : 'Add experience'}</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Company *</label>
                <input name="company" value={form.company} onChange={handleChange} required />
              </div>
              <div>
                <label>Role *</label>
                <input name="role" value={form.role} onChange={handleChange} required />
              </div>
              <div>
                <label>Employment type</label>
                <select name="employment_type" value={form.employment_type} onChange={handleChange}>
                  <option value="">Select</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} />
              </div>
              <div>
                <label>Start date</label>
                <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
              </div>
              <div>
                <label>End date</label>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={form.is_current}
                />
              </div>
            </div>
            <label className="checkbox-label">
              <input
                name="is_current"
                type="checkbox"
                checked={form.is_current}
                onChange={handleChange}
              />
              I currently work here
            </label>
            <label>Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
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

export default ExperienceSection;
