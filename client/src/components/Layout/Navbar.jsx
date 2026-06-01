import { useEffect, useState } from 'react';
import {
  RiMenuLine,
  RiMoonLine,
  RiNotification3Line,
  RiSearchLine,
  RiSunLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api, { getFileUrl } from '../../utils/api';

const Navbar = ({ title, breadcrumb, onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => setAvatar(res.data.profile?.profile_picture || null))
      .catch(() => {});
  }, []);

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button type="button" className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Menu">
          <RiMenuLine size={22} />
        </button>
        <div>
          <h1 className="navbar-title">{title}</h1>
          {breadcrumb && <div className="navbar-breadcrumb">{breadcrumb}</div>}
        </div>
      </div>

      <div className="navbar-actions">
        <button type="button" className="icon-btn" aria-label="Notifications" title="Notifications">
          <span className="pulse-badge" style={{ position: 'relative' }}>
            <RiNotification3Line size={20} />
          </span>
        </button>
        <button type="button" className="icon-btn" aria-label="Search" title="Search">
          <RiSearchLine size={20} />
        </button>
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
          <button
            type="button"
            className="sidebar-avatar"
            style={{ width: 36, height: 36, cursor: 'pointer' }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Profile menu"
          >
            {avatar ? (
              <img src={getFileUrl(avatar)} alt="" />
            ) : (
              <span style={{ fontSize: '0.85rem' }}>{user?.name?.charAt(0) || '?'}</span>
            )}
          </button>
          {menuOpen && (
            <div
              className="ui-card ui-card-pad"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                minWidth: 180,
                padding: '12px',
                zIndex: 60,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
