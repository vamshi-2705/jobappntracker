import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  RiAwardLine,
  RiBriefcaseLine,
  RiCodeLine,
  RiDashboardLine,
  RiFileTextLine,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiSettings3Line,
  RiStickyNoteLine,
  RiUserLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api, { getFileUrl } from '../../utils/api';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { to: '/profile', label: 'Profile', icon: RiUserLine },
  { to: '/skills', label: 'Skills', icon: RiCodeLine },
  { to: '/certificates', label: 'Certificates', icon: RiAwardLine },
  { to: '/jobs', label: 'Jobs', icon: RiBriefcaseLine },
  { to: '/resume', label: 'Resume', icon: RiFileTextLine },
  { to: '/interview', label: 'Interview', icon: RiQuestionLine },
  { to: '/notes', label: 'Notes', icon: RiStickyNoteLine },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [completion, setCompletion] = useState(0);
  const [headline, setHeadline] = useState('');
  const [avatar, setAvatar] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/dashboard/summary');
      setCompletion(data.profileCompletion || 0);
      const profileRes = await api.get('/profile');
      const isRemoved = localStorage.getItem('profile_picture_removed') === 'true';
      setAvatar(isRemoved ? null : (profileRes.data.profile?.profile_picture || null));
      setHeadline(profileRes.data.profile?.headline || '');
    } catch {
      setCompletion(0);
    }
  };

  useEffect(() => {
    load();
    const handleProfileUpdate = () => {
      load();
    };
    window.addEventListener('profile-picture-changed', handleProfileUpdate);
    return () => window.removeEventListener('profile-picture-changed', handleProfileUpdate);
  }, []);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <div className="sidebar-logo" style={{ background: 'transparent', width: 32, height: 32, padding: 0 }}>
              <img src="/logo.png" alt="CareerCraft AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <p className="sidebar-app-name" style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 50%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareerCraft AI</p>
              <p className="sidebar-app-sub">Your career companion</p>
            </div>
          </div>
        </div>

        <Link to="/profile" className="sidebar-user" title="View profile details">
          <div className="sidebar-avatar">
            {avatar ? (
              <img src={getFileUrl(avatar)} alt="" />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-name">{user?.name}</p>
            <p className="sidebar-headline">{headline || user?.email}</p>
          </div>
        </Link>

        <div className="sidebar-completion">
          <div className="completion-bar-header">
            <span>Profile completion</span>
            <strong>{completion}%</strong>
          </div>
          <div className="completion-bar-track">
            <div className="completion-bar-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <item.icon className="sidebar-icon" size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className="sidebar-link" onClick={onClose}>
            <RiSettings3Line size={20} />
            Settings
          </NavLink>
          <button type="button" className="btn btn-secondary sidebar-logout" onClick={logout}>
            <RiLogoutBoxRLine size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
