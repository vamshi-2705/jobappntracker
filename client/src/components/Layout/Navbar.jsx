import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiMenuLine,
  RiMoonLine,
  RiSunLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api, { getFileUrl } from '../../utils/api';
import SearchBar from '../Navbar/SearchBar';
import NotificationPanel from '../Navbar/NotificationPanel';

const Navbar = ({ title, breadcrumb, onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const loadAvatar = () => {
    api
      .get('/profile')
      .then((res) => {
        const isRemoved = localStorage.getItem('profile_picture_removed') === 'true';
        setAvatar(isRemoved ? null : (res.data.profile?.profile_picture || null));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAvatar();
    window.addEventListener('profile-picture-changed', loadAvatar);
    return () => window.removeEventListener('profile-picture-changed', loadAvatar);
  }, []);

  return (
    <header className="app-navbar" style={{ display: 'flex' }}>
      <div className="navbar-left">
        <button type="button" className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Menu">
          <RiMenuLine size={22} />
        </button>
        <div>
          <h1 className="navbar-title">{title}</h1>
          {breadcrumb && <div className="navbar-breadcrumb">{breadcrumb}</div>}
        </div>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NotificationPanel />
        <SearchBar />
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'light' ? <RiMoonLine size={20} /> : <RiSunLine size={20} />}
        </button>
        <div style={{ position: 'relative' }}>
          <Link
            to="/profile"
            className="sidebar-avatar"
            style={{ width: 36, height: 36, cursor: 'pointer', display: 'flex', textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Profile"
            title="View profile details"
          >
            {avatar ? (
              <img src={getFileUrl(avatar)} alt="" />
            ) : (
              <span style={{ fontSize: '0.85rem' }}>{user?.name?.charAt(0) || '?'}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
