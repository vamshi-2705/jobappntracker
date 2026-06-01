const AchievementCard = ({ achievement, onEdit, onDelete }) => (
  <article className="cert-card">
    <div className="cert-card-header">
      <h4>{achievement.title}</h4>
      <span className="badge badge-applied">{achievement.category}</span>
    </div>
    {achievement.issuer && <p className="item-sub">{achievement.issuer}</p>}
    {achievement.date && (
      <p className="item-meta">{new Date(achievement.date).toLocaleDateString()}</p>
    )}
    {achievement.description && <p className="item-desc">{achievement.description}</p>}
    <div className="cert-card-actions">
      <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEdit(achievement)}>
        Edit
      </button>
      <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(achievement)}>
        Delete
      </button>
    </div>
  </article>
);

export default AchievementCard;
