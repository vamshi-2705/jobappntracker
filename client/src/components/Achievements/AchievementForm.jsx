import { useEffect, useState } from 'react';

export const ACHIEVEMENT_CATEGORIES = [
  'Academic',
  'Professional',
  'Sports',
  'Volunteer',
  'Competition',
  'Other',
];

const empty = {
  title: '',
  description: '',
  date: '',
  issuer: '',
  category: 'Professional',
};

const AchievementForm = ({ achievement, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (achievement) {
      setForm({
        title: achievement.title || '',
        description: achievement.description || '',
        date: achievement.date ? achievement.date.split('T')[0] : '',
        issuer: achievement.issuer || '',
        category: achievement.category || 'Other',
      });
    } else {
      setForm(empty);
    }
  }, [achievement]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <h4>{achievement ? 'Edit achievement' : 'Add achievement'}</h4>
      <div className="form-grid">
        <div className="form-grid-full">
          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="form-grid-full">
          <label>Issuer</label>
          <input name="issuer" value={form.issuer} onChange={handleChange} />
        </div>
      </div>
      <label>Description</label>
      <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
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

export default AchievementForm;
