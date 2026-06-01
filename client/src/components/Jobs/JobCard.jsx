import { RiDeleteBinLine, RiEditLine } from 'react-icons/ri';
import Badge from '../UI/Badge';

const statusVariant = {
  Applied: 'primary',
  Interview: 'warning',
  Offered: 'success',
  Rejected: 'danger',
};

const statusBorder = {
  Applied: '',
  Interview: 'status-Interview',
  Offered: 'status-Offered',
  Rejected: 'status-Rejected',
};

const JobCard = ({ job, onEdit, onDelete, onSelect, isSelected }) => {
  const handleDelete = () => {
    if (window.confirm(`Delete application at ${job.company}?`)) {
      onDelete(job.id);
    }
  };

  const appliedDate = job.applied_date
    ? new Date(job.applied_date).toLocaleDateString()
    : '—';

  return (
    <article
      className={`job-card job-card-v2 ${statusBorder[job.status] || ''} ${onSelect ? 'job-card-selectable' : ''} ${isSelected ? 'job-card-selected' : ''}`}
      onClick={() => onSelect?.(job)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(job)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="job-card-header">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            className="stat-icon-wrap primary"
            style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}
          >
            {job.company?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3>{job.position}</h3>
            <p className="job-company">{job.company}</p>
          </div>
        </div>
        <Badge variant={statusVariant[job.status] || 'primary'}>{job.status}</Badge>
      </div>
      <p className="job-meta">Applied: {appliedDate}</p>
      {job.notes && <p className="job-notes">{job.notes}</p>}
      <div className="job-card-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEdit(job)} title="Edit">
          <RiEditLine size={16} /> Edit
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete} title="Delete">
          <RiDeleteBinLine size={16} /> Delete
        </button>
      </div>
    </article>
  );
};

export default JobCard;
