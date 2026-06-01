import SkillBadge from './SkillBadge';

const SkillsByCategory = ({ skills, onEdit, onDelete }) => {
  if (!skills.length) {
    return (
      <div className="empty-state">
        <p>No skills found.</p>
        <p className="empty-hint">Add a skill or change your filters.</p>
      </div>
    );
  }

  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="skills-by-category">
      {categories.map((category) => (
        <section key={category} className="skill-category-block">
          <h3 className="category-heading">{category}</h3>
          <div className="skill-badge-row">
            {grouped[category].map((skill) => (
              <SkillBadge key={skill.id} skill={skill} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default SkillsByCategory;
