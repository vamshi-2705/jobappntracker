import { useEffect, useState } from 'react';

export const COURSE_PLATFORMS = ['Udemy', 'Coursera', 'edX', 'YouTube', 'Other'];

const empty = {
  title: '',
  platform: 'Udemy',
  completion_date: '',
  duration: '',
  url: '',
};

const CourseForm = ({ course, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || '',
        platform: course.platform || 'Other',
        completion_date: course.completion_date ? course.completion_date.split('T')[0] : '',
        duration: course.duration || '',
        url: course.url || '',
      });
    } else {
      setForm(empty);
    }
  }, [course]);

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
      <h4>{course ? 'Edit course' : 'Add course'}</h4>
      <div className="form-grid">
        <div className="form-grid-full">
          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Platform</label>
          <select name="platform" value={form.platform} onChange={handleChange}>
            {COURSE_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Duration</label>
          <input name="duration" value={form.duration} onChange={handleChange} placeholder="10 hours" />
        </div>
        <div>
          <label>Completion date</label>
          <input name="completion_date" type="date" value={form.completion_date} onChange={handleChange} />
        </div>
        <div className="form-grid-full">
          <label>Course URL</label>
          <input name="url" type="url" value={form.url} onChange={handleChange} placeholder="https://..." />
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

export default CourseForm;
