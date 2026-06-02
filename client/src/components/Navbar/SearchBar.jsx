import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiSearchLine } from 'react-icons/ri';
import api from '../../utils/api';

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ jobs: [], skills: [], certificates: [] });
  const [data, setData] = useState({ jobs: [], skills: [], certificates: [] });

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all data when search is opened
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [jobsRes, skillsRes, certsRes] = await Promise.allSettled([
            api.get('/jobs'),
            api.get('/skills'),
            api.get('/certificates')
          ]);

          setData({
            jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data : [],
            skills: skillsRes.status === 'fulfilled' ? skillsRes.value.data : [],
            certificates: certsRes.status === 'fulfilled' ? certsRes.value.data : []
          });
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults({ jobs: [], skills: [], certificates: [] });
    }
  }, [open]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Handle keydown Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items in real time
  useEffect(() => {
    if (!query.trim()) {
      setResults({ jobs: [], skills: [], certificates: [] });
      return;
    }

    const q = query.toLowerCase();
    const filteredJobs = data.jobs.filter(
      (j) => j.position?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
    );
    const filteredSkills = data.skills.filter(
      (s) => s.name?.toLowerCase().includes(q)
    );
    const filteredCerts = data.certificates.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.issuer?.toLowerCase().includes(q)
    );

    setResults({
      jobs: filteredJobs,
      skills: filteredSkills,
      certificates: filteredCerts
    });
  }, [query, data]);

  const highlightText = (text, word) => {
    if (!word) return text;
    const parts = String(text).split(new RegExp(`(${word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === word.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: 'rgba(99, 102, 241, 0.3)', color: '#f9fafb', borderRadius: '2px', padding: '0 2px' }}>{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const q = query.toLowerCase().trim();
    if (!q) {
      setOpen(false);
      return;
    }

    // Direct section keyword interceptions
    if (['jobs', 'job', 'applications', 'apply'].includes(q)) {
      handleItemClick('/jobs');
      return;
    }
    if (['skills', 'skill', 'languages', 'lang'].includes(q)) {
      handleItemClick('/skills');
      return;
    }
    if (['certificates', 'cert', 'credentials', 'courses', 'achievements', 'course'].includes(q)) {
      handleItemClick('/certificates');
      return;
    }
    if (['notes', 'note'].includes(q)) {
      handleItemClick('/notes');
      return;
    }
    if (q === 'dashboard') {
      handleItemClick('/dashboard');
      return;
    }
    if (q === 'profile') {
      handleItemClick('/profile');
      return;
    }
    if (q === 'settings') {
      handleItemClick('/settings');
      return;
    }

    if (results.jobs.length > 0) {
      handleItemClick('/jobs');
    } else if (results.skills.length > 0) {
      handleItemClick('/skills');
    } else if (results.certificates.length > 0) {
      handleItemClick('/certificates');
    }
  };

  const handleItemClick = (route) => {
    navigate(route);
    setOpen(false);
  };

  const hasResults = results.jobs.length > 0 || results.skills.length > 0 || results.certificates.length > 0;

  return (
    <div className="search-container" ref={containerRef}>
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <button
          type="submit"
          className="icon-btn"
          aria-label="Search"
          title="Search"
        >
          <RiSearchLine size={20} />
        </button>

        <div className={`search-bar ${open ? 'open' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search jobs, skills, certificates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {open && query.trim() && (
        <div className="search-results">
          {!hasResults ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            <>
              {results.jobs.length > 0 && (
                <div className="search-result-group">
                  <div className="search-result-group-title">Jobs</div>
                  {results.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="search-result-item"
                      onClick={() => handleItemClick('/jobs')}
                    >
                      <div className="search-result-icon">💼</div>
                      <div>
                        <div className="search-result-text">
                          {highlightText(job.position, query)}
                        </div>
                        <div className="search-result-sub">
                          {highlightText(job.company, query)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.skills.length > 0 && (
                <div className="search-result-group">
                  <div className="search-result-group-title">Skills</div>
                  {results.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="search-result-item"
                      onClick={() => handleItemClick('/skills')}
                    >
                      <div className="search-result-icon">🛠️</div>
                      <div>
                        <div className="search-result-text">
                          {highlightText(skill.name, query)}
                        </div>
                        <div className="search-result-sub">
                          {skill.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.certificates.length > 0 && (
                <div className="search-result-group">
                  <div className="search-result-group-title">Certificates</div>
                  {results.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="search-result-item"
                      onClick={() => handleItemClick('/certificates')}
                    >
                      <div className="search-result-icon">📜</div>
                      <div>
                        <div className="search-result-text">
                          {highlightText(cert.title, query)}
                        </div>
                        <div className="search-result-sub">
                          {highlightText(cert.issuer, query)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
