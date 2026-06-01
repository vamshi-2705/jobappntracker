import { useState } from 'react';
import api from '../../utils/api';

const emptyProject = {
  title: '',
  description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  start_date: '',
  end_date: '',
};

const ProjectsSection = ({ items, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProject);
    setShowForm(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      tech_stack: item.tech_stack || '',
      github_url: item.github_url || '',
      live_url: item.live_url || '',
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
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
    try {
      if (editing) {
        await api.put(`/profile/projects/${editing.id}`, form);
      } else {
        await api.post('/profile/projects', form);
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/profile/projects/${id}`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="profile-section-card">
      <div className="section-title-row">
        <h3>Projects</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={openAdd}>
          + Add
        </button>
      </div>
      {error && !showForm && <div className="alert alert-error">{error}</div>}
      {!items.length && <p className="empty-inline">No projects added yet.</p>}
      <div className="profile-item-list">
        {items.map((item) => (
          <article key={item.id} className="profile-item">
            <div>
              <h4>{item.title}</h4>
              {item.tech_stack && <p className="item-meta">{item.tech_stack}</p>}
              {item.description && <p className="item-desc">{item.description}</p>}
              <div className="project-links">
                {item.github_url && (
                  <a href={item.github_url} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
                {item.live_url && (
                  <a href={item.live_url} target="_blank" rel="noreferrer">
                    Live demo
                  </a>
                )}
              </div>
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
          <h4>{editing ? 'Edit project' : 'Add project'}</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-grid-full">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div>
                <label>Tech stack</label>
                <input name="tech_stack" value={form.tech_stack} onChange={handleChange} placeholder="React, Node.js, PostgreSQL" />
              </div>
              <div>
                <label>GitHub URL</label>
                <input name="github_url" type="url" value={form.github_url} onChange={handleChange} />
              </div>
              <div>
                <label>Live URL</label>
                <input name="live_url" type="url" value={form.live_url} onChange={handleChange} />
              </div>
              <div>
                <label>Start date</label>
                <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
              </div>
              <div>
                <label>End date</label>
                <input name="end_date" type="date" value={form.end_date} onChange={handleChange} />
              </div>
            </div>
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

export default ProjectsSection;
