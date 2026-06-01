import { useState } from 'react';
import api from '../../utils/api';

export const LANGUAGE_PROFICIENCY = ['Basic', 'Conversational', 'Fluent', 'Native'];

const proficiencyClass = {
  Basic: 'lang-basic',
  Conversational: 'lang-conversational',
  Fluent: 'lang-fluent',
  Native: 'lang-native',
};

const LanguageSection = ({ languages, onRefresh }) => {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState('Conversational');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/languages', { name: name.trim(), proficiency });
      setName('');
      setProficiency('Conversational');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add language');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lang) => {
    if (!window.confirm(`Remove ${lang.name}?`)) return;
    try {
      await api.delete(`/languages/${lang.id}`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete language');
    }
  };

  return (
    <div className="profile-section-card language-section">
      <h3>Languages</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="language-add-form" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Language (e.g. English)"
          required
        />
        <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
          {LANGUAGE_PROFICIENCY.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : 'Add'}
        </button>
      </form>
      {!languages.length && <p className="empty-inline">No languages added yet.</p>}
      <div className="language-list">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className={`language-chip ${proficiencyClass[lang.proficiency] || 'lang-conversational'}`}
          >
            <span>
              <strong>{lang.name}</strong> · {lang.proficiency}
            </span>
            <button
              type="button"
              className="badge-btn"
              onClick={() => handleDelete(lang)}
              aria-label={`Delete ${lang.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageSection;
