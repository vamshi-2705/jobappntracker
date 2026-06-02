import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/UI/PageHeader';

const PRESETS = [
  { name: 'Brand Blue', color: '#2563eb' },
  { name: 'Brand Teal', color: '#0d9488' },
  { name: 'Brand Green', color: '#10b981' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Red', color: '#ef4444' },
];

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();

  // Account state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications toggles
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('settings_notifs');
    return saved ? JSON.parse(saved) : {
      followUp: true,
      profileIncomplete: true,
      certExpiry: true,
      emailNotifs: true,
    };
  });

  // Privacy toggles
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('settings_privacy');
    return saved ? JSON.parse(saved) : {
      visible: true,
      showEmail: true,
    };
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // Simulate updating user state globally
    updateUser({ ...user, name, email });
    toast.success('Account settings saved successfully');
    
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleNotif = (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    localStorage.setItem('settings_notifs', JSON.stringify(next));
    toast.success('Notification settings updated');
  };

  const handleTogglePrivacy = (key) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    localStorage.setItem('settings_privacy', JSON.stringify(next));
    toast.success('Privacy settings updated');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type "DELETE" exactly to confirm');
      return;
    }
    toast.success('Account permanently deleted');
    setShowDeleteModal(false);
    logout();
  };

  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Manage your account preferences and application theme" />

      {/* Account Settings */}
      <section className="settings-section">
        <h3 className="settings-section-title">Account Settings</h3>
        <p className="settings-section-desc">Update your personal information and change your password</p>
        
        <form onSubmit={handleSaveAccount} className="profile-form-grid" style={{ display: 'block' }}>
          <div className="form-field">
            <label htmlFor="settings-name">Full Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="settings-email">Email Address</label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid #374151', margin: '20px 0', paddingTop: '20px' }}>
            <h4 style={{ color: '#f9fafb', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Change Password</h4>
            <div className="form-field">
              <label htmlFor="settings-old-pass">Current Password</label>
              <input
                id="settings-old-pass"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-form-grid">
              <div className="form-field">
                <label htmlFor="settings-new-pass">New Password</label>
                <input
                  id="settings-new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-field">
                <label htmlFor="settings-confirm-pass">Confirm New Password</label>
                <input
                  id="settings-confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </form>
      </section>

      {/* Appearance Settings */}
      <section className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>
        <p className="settings-section-desc">Customize the color scheme and design theme of your dashboard</p>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Dark Mode</div>
            <div className="settings-row-desc">Switch between light and dark theme mode</div>
          </div>
          <div
            className={`toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
          >
            <div className="toggle-dot" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Accent Color</div>
            <div className="settings-row-desc">Select a theme highlight color for active states</div>
          </div>
          <div className="color-options">
            {PRESETS.map((preset) => (
              <div
                key={preset.color}
                className={`color-dot ${accentColor === preset.color ? 'selected' : ''}`}
                style={{ backgroundColor: preset.color }}
                onClick={() => {
                  setAccentColor(preset.color);
                  toast.success(`Theme accent set to ${preset.name}`);
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Settings */}
      <section className="settings-section">
        <h3 className="settings-section-title">Notifications</h3>
        <p className="settings-section-desc">Control what alerts and notifications you receive</p>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Job Follow-up Reminders</div>
            <div className="settings-row-desc">Get notified about scheduled job follow-ups</div>
          </div>
          <div
            className={`toggle ${notifs.followUp ? 'active' : ''}`}
            onClick={() => handleToggleNotif('followUp')}
          >
            <div className="toggle-dot" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Profile Incomplete Reminders</div>
            <div className="settings-row-desc">Receive prompts to complete your portfolio sections</div>
          </div>
          <div
            className={`toggle ${notifs.profileIncomplete ? 'active' : ''}`}
            onClick={() => handleToggleNotif('profileIncomplete')}
          >
            <div className="toggle-dot" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Certificate Expiration Alerts</div>
            <div className="settings-row-desc">Alerts when qualifications are expiring soon</div>
          </div>
          <div
            className={`toggle ${notifs.certExpiry ? 'active' : ''}`}
            onClick={() => handleToggleNotif('certExpiry')}
          >
            <div className="toggle-dot" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Email Notifications</div>
            <div className="settings-row-desc">Receive copy of notifications directly in your mailbox</div>
          </div>
          <div
            className={`toggle ${notifs.emailNotifs ? 'active' : ''}`}
            onClick={() => handleToggleNotif('emailNotifs')}
          >
            <div className="toggle-dot" />
          </div>
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="settings-section">
        <h3 className="settings-section-title">Privacy</h3>
        <p className="settings-section-desc">Configure recruiter visibility options</p>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Recruiter Search Visibility</div>
            <div className="settings-row-desc">Make your profile discoverable for headhunters</div>
          </div>
          <div
            className={`toggle ${privacy.visible ? 'active' : ''}`}
            onClick={() => handleTogglePrivacy('visible')}
          >
            <div className="toggle-dot" />
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Display Email on Profile</div>
            <div className="settings-row-desc">Allow recruiters to view email on your cards</div>
          </div>
          <div
            className={`toggle ${privacy.showEmail ? 'active' : ''}`}
            onClick={() => handleTogglePrivacy('showEmail')}
          >
            <div className="toggle-dot" />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section danger-zone">
        <h3 className="settings-section-title">Danger Zone</h3>
        <p className="settings-section-desc">Irreversible options relating to your account</p>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Delete Account</div>
            <div className="settings-row-desc">Permanently erase all job apps, resume history, and profile data</div>
          </div>
          <button
            type="button"
            className="btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="crop-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h3 style={{ margin: '0 0 12px', color: '#ef4444', fontSize: '1.1rem', fontWeight: 600 }}>
              Are you absolutely sure?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: 1.5, marginBottom: '16px' }}>
              This action cannot be undone. All your details, history, resume, and credentials will be deleted forever.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
              Type <strong style={{ color: '#ef4444' }}>DELETE</strong> in the box below to confirm:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '0.875rem',
                outline: 'none',
                marginBottom: '16px',
              }}
            />

            <div className="crop-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{ padding: '8px 18px', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', cursor: 'pointer', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteAccount}
                style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
