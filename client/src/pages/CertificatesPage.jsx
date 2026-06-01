import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import PageHeader from '../components/UI/PageHeader';
import Tabs from '../components/UI/Tabs';
import CertificateCard from '../components/Certificates/CertificateCard';
import CertificateForm from '../components/Certificates/CertificateForm';
import AchievementCard from '../components/Achievements/AchievementCard';
import AchievementForm, { ACHIEVEMENT_CATEGORIES } from '../components/Achievements/AchievementForm';
import CourseCard from '../components/Courses/CourseCard';
import CourseForm from '../components/Courses/CourseForm';

const TABS = [
  { id: 'certificates', label: 'Certificates' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'courses', label: 'Courses' },
];

const CertificatesPage = () => {
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchCertificates = useCallback(async () => {
    const { data } = await api.get('/certificates');
    setCertificates(data);
  }, []);

  const fetchAchievements = useCallback(async () => {
    const params = categoryFilter !== 'All' ? { category: categoryFilter } : {};
    const { data } = await api.get('/achievements', { params });
    setAchievements(data);
  }, [categoryFilter]);

  const fetchCourses = useCallback(async () => {
    const { data } = await api.get('/courses');
    setCourses(data);
  }, []);

  const loadTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'certificates') await fetchCertificates();
      if (activeTab === 'achievements') await fetchAchievements();
      if (activeTab === 'courses') await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchCertificates, fetchAchievements, fetchCourses]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleCertSubmit = async (formData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await api.put(`/certificates/${editing.id}`, formData);
        setSuccess('Certificate updated');
      } else {
        await api.post('/certificates', formData);
        setSuccess('Certificate added');
      }
      closeForm();
      await fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save certificate');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAchievementSubmit = async (formData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await api.put(`/achievements/${editing.id}`, formData);
        setSuccess('Achievement updated');
      } else {
        await api.post('/achievements', formData);
        setSuccess('Achievement added');
      }
      closeForm();
      await fetchAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save achievement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCourseSubmit = async (formData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await api.put(`/courses/${editing.id}`, formData);
        setSuccess('Course updated');
      } else {
        await api.post('/courses', formData);
        setSuccess('Course added');
      }
      closeForm();
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCert = async (item) => {
    if (!window.confirm(`Delete certificate "${item.title}"?`)) return;
    try {
      await api.delete(`/certificates/${item.id}`);
      setSuccess('Certificate deleted');
      await fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteAchievement = async (item) => {
    if (!window.confirm(`Delete achievement "${item.title}"?`)) return;
    try {
      await api.delete(`/achievements/${item.id}`);
      setSuccess('Achievement deleted');
      await fetchAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteCourse = async (item) => {
    if (!window.confirm(`Delete course "${item.title}"?`)) return;
    try {
      await api.delete(`/courses/${item.id}`);
      setSuccess('Course deleted');
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const renderForm = () => {
    if (!showForm) return null;
    if (activeTab === 'certificates') {
      return (
        <div className="profile-section-card">
          <CertificateForm
            certificate={editing}
            onSubmit={handleCertSubmit}
            onCancel={closeForm}
            loading={formLoading}
          />
        </div>
      );
    }
    if (activeTab === 'achievements') {
      return (
        <div className="profile-section-card">
          <AchievementForm
            achievement={editing}
            onSubmit={handleAchievementSubmit}
            onCancel={closeForm}
            loading={formLoading}
          />
        </div>
      );
    }
    return (
      <div className="profile-section-card">
        <CourseForm
          course={editing}
          onSubmit={handleCourseSubmit}
          onCancel={closeForm}
          loading={formLoading}
        />
      </div>
    );
  };

  return (
    <div className="certificates-page">
      <PageHeader title="Certificates & learning" subtitle="Credentials, achievements, and courses" />
      <Tabs
        tabs={TABS}
        active={activeTab}
        onChange={(id) => {
          setActiveTab(id);
          closeForm();
        }}
      />

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="skills-toolbar profile-section-card">
        {activeTab === 'achievements' && (
          <div className="skills-filters" style={{ flex: 1 }}>
            <div>
              <label htmlFor="ach-category">Filter by category</label>
              <select
                id="ach-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All</option>
                {ACHIEVEMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add {activeTab === 'certificates' ? 'certificate' : activeTab.slice(0, -1)}
        </button>
      </div>

      {renderForm()}

      {loading ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="cert-grid">
          {activeTab === 'certificates' &&
            (certificates.length ? (
              certificates.map((c) => (
                <CertificateCard
                  key={c.id}
                  certificate={c}
                  onEdit={openEdit}
                  onDelete={handleDeleteCert}
                  onRefresh={fetchCertificates}
                />
              ))
            ) : (
              <p className="empty-inline">No certificates yet.</p>
            ))}
          {activeTab === 'achievements' &&
            (achievements.length ? (
              achievements.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  onEdit={openEdit}
                  onDelete={handleDeleteAchievement}
                />
              ))
            ) : (
              <p className="empty-inline">No achievements yet.</p>
            ))}
          {activeTab === 'courses' &&
            (courses.length ? (
              courses.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  onEdit={openEdit}
                  onDelete={handleDeleteCourse}
                />
              ))
            ) : (
              <p className="empty-inline">No courses yet.</p>
            ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
