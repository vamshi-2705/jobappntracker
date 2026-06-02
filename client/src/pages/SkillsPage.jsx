import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import PageHeader from '../components/UI/PageHeader';
import Badge from '../components/UI/Badge';
import SkillForm, { SKILL_CATEGORIES } from '../components/Skills/SkillForm';
import SkillsByCategory from '../components/Skills/SkillsByCategory';
import LanguageSection from '../components/Skills/LanguageSection';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const fetchSkills = useCallback(async () => {
    try {
      const params = {};
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/skills', { params });
      setSkills(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skills');
    }
  }, [categoryFilter, search]);

  const fetchLanguages = useCallback(async () => {
    try {
      const { data } = await api.get('/languages');
      setLanguages(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load languages');
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchSkills(), fetchLanguages()]);
    setLoading(false);
  }, [fetchSkills, fetchLanguages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAll();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadAll]);

  const handleAddSkill = () => {
    setEditingSkill(null);
    setShowForm(true);
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
    try {
      await api.delete(`/skills/${skill.id}`);
      setSuccess('Skill deleted');
      await fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingSkill) {
        await api.put(`/skills/${editingSkill.id}`, formData);
        setSuccess('Skill updated');
      } else {
        await api.post('/skills', formData);
        setSuccess('Skill added');
      }
      setShowForm(false);
      setEditingSkill(null);
      await fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="skills-page">
      <PageHeader
        title="Skills"
        subtitle="Organize your technical and soft skills"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge variant="primary">{skills.length} skills</Badge>
            <button type="button" className="btn btn-primary" onClick={handleAddSkill}>
              + Add skill
            </button>
          </div>
        }
      />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="skills-toolbar profile-section-card">
        <div className="skills-filters">
          <div>
            <label htmlFor="skill-search">Search skills</label>
            <input
              id="skill-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. React, Python..."
            />
          </div>
          <div>
            <label htmlFor="skill-category">Filter by category</label>
            <select
              id="skill-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All categories</option>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="proficiency-legend">
        <span className="proficiency-badge skill-badge-beginner">
          <span className="proficiency-dot" style={{ backgroundColor: '#cbd5e1' }} />
          Beginner
        </span>
        <span className="proficiency-badge skill-badge-intermediate">
          <span className="proficiency-dot" style={{ backgroundColor: '#93c5fd' }} />
          Intermediate
        </span>
        <span className="proficiency-badge skill-badge-advanced">
          <span className="proficiency-dot" style={{ backgroundColor: '#86efac' }} />
          Advanced
        </span>
        <span className="proficiency-badge skill-badge-expert">
          <span className="proficiency-dot" style={{ backgroundColor: '#d8b4fe' }} />
          Expert
        </span>
      </div>

      {showForm && (
        <div className="profile-section-card">
          <SkillForm
            skill={editingSkill}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingSkill(null);
            }}
            loading={formLoading}
          />
        </div>
      )}

      {loading ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : (
        <SkillsByCategory
          skills={skills}
          onEdit={handleEditSkill}
          onDelete={handleDeleteSkill}
        />
      )}

      <LanguageSection languages={languages} onRefresh={fetchLanguages} />
    </div>
  );
};

export default SkillsPage;
