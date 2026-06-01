import JobCard from './JobCard';

const JobList = ({ jobs, onEdit, onDelete, onSelect, selectedJobId }) => {
  if (!jobs.length) {
    return (
      <div className="empty-state">
        <p>No job applications yet.</p>
        <p className="empty-hint">Click &quot;Add job&quot; to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedJobId != null && selectedJobId === job.id}
        />
      ))}
    </div>
  );
};

export default JobList;
