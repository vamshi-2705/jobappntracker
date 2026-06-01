const CourseCard = ({ course, onEdit, onDelete }) => (
  <article className="cert-card">
    <div className="cert-card-header">
      <h4>{course.title}</h4>
      <span className="badge badge-interview">{course.platform}</span>
    </div>
    {course.duration && <p className="item-meta">Duration: {course.duration}</p>}
    {course.completion_date && (
      <p className="item-meta">
        Completed: {new Date(course.completion_date).toLocaleDateString()}
      </p>
    )}
    <div className="cert-card-actions">
      {course.url && (
        <a href={course.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
          Open course
        </a>
      )}
      <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEdit(course)}>
        Edit
      </button>
      <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(course)}>
        Delete
      </button>
    </div>
  </article>
);

export default CourseCard;
