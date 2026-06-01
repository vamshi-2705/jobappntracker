import { useEffect, useState } from 'react';

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Programming Language',
  'Mobile',
  'AI/ML',
  'Tools',
  'Soft Skills',
  'Other',
];

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const emptySkill = {
  name: '',
  category: 'Frontend',
  proficiency: 'Intermediate',
  years_of_experience: '',
};

const SkillForm = ({ skill, onSubmit, onCancel, loading }) => {
  const [values, setValues] = useState(emptySkill);

  useEffect(() => {
    if (skill) {
      setValues({
        name: skill.name || '',
        category: skill.category || 'Other',
        proficiency: skill.proficiency || 'Beginner',
        years_of_experience:
          skill.years_of_experience != null ? String(skill.years_of_experience) : '',
      });
    } else {
      setValues(emptySkill);
    }
  }, [skill]);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...values,
      years_of_experience: values.years_of_experience
        ? Number(values.years_of_experience)
        : null,
    });
  };

  return (
    <form className="skill-form" onSubmit={handleSubmit}>
      <h4>{skill ? 'Edit skill' : 'Add skill'}</h4>
      <div className="form-grid">
        <div className="form-grid-full">
          <label>Skill name *</label>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            placeholder="e.g. React"
          />
        </div>
        <div>
          <label>Category</label>
          <select name="category" value={values.category} onChange={handleChange}>
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Proficiency</label>
          <select name="proficiency" value={values.proficiency} onChange={handleChange}>
            {PROFICIENCY_LEVELS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Years of experience</label>
          <input
            name="years_of_experience"
            type="number"
            min="0"
            max="50"
            value={values.years_of_experience}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : skill ? 'Save' : 'Add skill'}
        </button>
      </div>
    </form>
  );
};

export default SkillForm;
