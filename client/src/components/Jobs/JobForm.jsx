import { useEffect, useState } from 'react';

const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected'];

const emptyForm = {
  company: '',
  position: '',
  status: 'Applied',
  job_description: '',
  notes: '',
  applied_date: new Date().toISOString().split('T')[0],
};

const JobForm = ({ job, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (job) {
      setForm({
        company: job.company || '',
        position: job.position || '',
        status: job.status || 'Applied',
        job_description: job.job_description || '',
        notes: job.notes || '',
        applied_date: job.applied_date
          ? job.applied_date.split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setForm(emptyForm);
    }
  }, [job]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h3>{job ? 'Edit job' : 'Add new job'}</h3>
      <div className="form-grid">
        <div>
          <label htmlFor="company">Company *</label>
          <input
            id="company"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="e.g. Google"
          />
        </div>
        <div>
          <label htmlFor="position">Position *</label>
          <input
            id="position"
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            placeholder="e.g. Software Engineer"
          />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="applied_date">Applied date</label>
          <input
            id="applied_date"
            name="applied_date"
            type="date"
            value={form.applied_date}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <label htmlFor="job_description">Job description</label>
        <textarea
          id="job_description"
          name="job_description"
          rows={4}
          value={form.job_description}
          onChange={handleChange}
          placeholder="Paste the job posting here for AI features..."
        />
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={form.notes}
          onChange={handleChange}
          placeholder="Referral, recruiter name, etc."
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : job ? 'Save changes' : 'Add job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
