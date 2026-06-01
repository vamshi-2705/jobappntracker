import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import JobList from '../components/Jobs/JobList';
import JobForm from '../components/Jobs/JobForm';
import ResumeMatch from '../components/AI/ResumeMatch';
import CoverLetter from '../components/AI/CoverLetter';
import InterviewQuestions from '../components/AI/InterviewQuestions';

const TABS = [
  { id: 'jobs', label: 'Applications' },
  { id: 'match', label: 'Resume match' },
  { id: 'cover', label: 'Cover letter' },
  { id: 'questions', label: 'Interview Qs' },
];

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [resumeText, setResumeText] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const stats = {
    total: jobs.length,
    Applied: jobs.filter((j) => j.status === 'Applied').length,
    Interview: jobs.filter((j) => j.status === 'Interview').length,
    Offered: jobs.filter((j) => j.status === 'Offered').length,
    Rejected: jobs.filter((j) => j.status === 'Rejected').length,
  };

  return (
    <div className="dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-applied">
          <span className="stat-value">{stats.Applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat-card stat-interview">
          <span className="stat-value">{stats.Interview}</span>
          <span className="stat-label">Interview</span>
        </div>
        <div className="stat-card stat-offered">
          <span className="stat-value">{stats.Offered}</span>
          <span className="stat-label">Offered</span>
        </div>
        <div className="stat-card stat-rejected">
          <span className="stat-value">{stats.Rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </section>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {selectedJob && activeTab !== 'jobs' && (
        <p className="selected-job-banner">
          Using job: <strong>{selectedJob.position}</strong> at {selectedJob.company}
          <button type="button" className="link-btn" onClick={() => setSelectedJob(null)}>
            Clear
          </button>
        </p>
      )}

      {activeTab === 'jobs' && (
        <section className="jobs-section">
          <div className="section-header">
            <h2>Your applications</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingJob(null);
                setShowForm(true);
              }}
            >
              + Add job
            </button>
          </div>
          {showForm && (
            <div className="modal-overlay">
              <div className="modal">
                <JobForm
                  job={editingJob}
                  onSubmit={async (formData) => {
                    setFormLoading(true);
                    try {
                      if (editingJob) await api.put(`/jobs/${editingJob.id}`, formData);
                      else await api.post('/jobs', formData);
                      setShowForm(false);
                      setEditingJob(null);
                      setSuccess('Saved');
                      await fetchJobs();
                    } catch (err) {
                      setError(err.response?.data?.message || 'Failed to save');
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingJob(null);
                  }}
                  loading={formLoading}
                />
              </div>
            </div>
          )}
          {loading ? (
            <div className="page-center">
              <div className="spinner" />
            </div>
          ) : (
            <JobList
              jobs={jobs}
              onEdit={(job) => {
                setEditingJob(job);
                setShowForm(true);
              }}
              onDelete={async (id) => {
                if (!window.confirm('Delete this job?')) return;
                await api.delete(`/jobs/${id}`);
                if (selectedJob?.id === id) setSelectedJob(null);
                await fetchJobs();
              }}
              onSelect={(job) => {
                setSelectedJob(job);
                setActiveTab('match');
              }}
              selectedJobId={selectedJob?.id}
            />
          )}
        </section>
      )}

      {activeTab === 'match' && (
        <ResumeMatch selectedJob={selectedJob} resume={resumeText} onResumeChange={setResumeText} />
      )}
      {activeTab === 'cover' && (
        <CoverLetter selectedJob={selectedJob} resume={resumeText} onResumeChange={setResumeText} />
      )}
      {activeTab === 'questions' && (
        <InterviewQuestions
          selectedJob={selectedJob}
          resume={resumeText}
          onResumeChange={setResumeText}
        />
      )}
    </div>
  );
};

export default JobsPage;
