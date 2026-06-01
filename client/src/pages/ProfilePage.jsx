import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { getFileUrl } from '../utils/api';
import PageHeader from '../components/UI/PageHeader';
import CompletionBar from '../components/Profile/CompletionBar';
import ProfilePicture from '../components/Profile/ProfilePicture';
import ProfileResumeUpload from '../components/Profile/ResumeUpload';
import BasicInfo from '../components/Profile/BasicInfo';
import SocialLinks from '../components/Profile/SocialLinks';
import EducationSection from '../components/Profile/EducationSection';
import ExperienceSection from '../components/Profile/ExperienceSection';
import ProjectsSection from '../components/Profile/ProjectsSection';

const emptyForm = {
  headline: '',
  bio: '',
  phone: '',
  location: '',
  date_of_birth: '',
  gender: '',
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const applyProfileToForm = (profile) => {
    if (!profile) {
      setForm(emptyForm);
      return;
    }
    setForm({
      headline: profile.headline || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      location: profile.location || '',
      date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
      gender: profile.gender || '',
      github_url: profile.github_url || '',
      linkedin_url: profile.linkedin_url || '',
      portfolio_url: profile.portfolio_url || '',
    });
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/profile');
      setData(res);
      applyProfileToForm(res.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const method = data?.profile ? 'put' : 'post';
      const { data: res } = await api[method]('/profile', form);
      toast.success('Profile saved successfully');
      await fetchProfile();
      if (res.completionPercent !== undefined) {
        setData((prev) => ({
          ...prev,
          completionPercent: res.completionPercent,
          profile: res.profile,
        }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadRefresh = async () => {
    await fetchProfile();
    setSuccess('Upload successful');
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" aria-label="Loading profile" />
      </div>
    );
  }

  const completion = data?.completionPercent ?? data?.profile?.completion_percent ?? 0;

  const displayName = data?.user?.name || user?.name;
  const headline = form.headline || 'Add a headline to stand out';
  const avatarUrl = data?.profile?.profile_picture;

  return (
    <div className="profile-page">
      <div className="profile-banner" />
      <div className="profile-avatar-lg">
        {avatarUrl ? (
          <img src={getFileUrl(avatarUrl)} alt="" />
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            {displayName?.charAt(0) || '?'}
          </span>
        )}
      </div>
      <div className="profile-header-meta">
        <PageHeader title={displayName} subtitle={headline} />
        <CompletionBar percent={completion} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-top-grid">
        <div className="profile-section-card profile-photo-card">
          <ProfilePicture
            pictureUrl={avatarUrl}
            onUploaded={handleUploadRefresh}
          />
          <ProfileResumeUpload
            resumeUrl={data?.profile?.resume_url}
            onUploaded={handleUploadRefresh}
          />
        </div>
        <form className="profile-form-main" onSubmit={handleSave}>
          <BasicInfo user={data?.user || user} form={form} onChange={handleChange} />
          <SocialLinks form={form} onChange={handleChange} />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="btn-spinner" /> : 'Save profile'}
          </button>
        </form>
      </div>

      <EducationSection items={data?.education || []} onRefresh={fetchProfile} />
      <ExperienceSection items={data?.experience || []} onRefresh={fetchProfile} />
      <ProjectsSection items={data?.projects || []} onRefresh={fetchProfile} />
    </div>
  );
};

export default ProfilePage;
