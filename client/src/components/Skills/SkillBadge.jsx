const proficiencyClass = {
  Beginner: 'skill-badge-beginner',
  Intermediate: 'skill-badge-intermediate',
  Advanced: 'skill-badge-advanced',
  Expert: 'skill-badge-expert',
};

const SkillBadge = ({ skill, onEdit, onDelete }) => (
  <span className={`skill-badge ${proficiencyClass[skill.proficiency] || 'skill-badge-beginner'}`}>
    <span className="skill-badge-name">{skill.name}</span>
    {skill.years_of_experience != null && (
      <span className="skill-badge-years">{skill.years_of_experience}y</span>
    )}
    <span className="skill-badge-level">{skill.proficiency}</span>
    <span className="skill-badge-actions">
      <button type="button" className="badge-btn" onClick={() => onEdit(skill)} aria-label="Edit">
        ✎
      </button>
      <button type="button" className="badge-btn" onClick={() => onDelete(skill)} aria-label="Delete">
        ×
      </button>
    </span>
  </span>
);

export default SkillBadge;
