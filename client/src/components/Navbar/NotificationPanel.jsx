import { useEffect, useRef, useState } from 'react';
import { RiCheckDoubleLine, RiNotification3Line, RiTimeLine } from 'react-icons/ri';
import api from '../../utils/api';

const timeAgo = (date) => {
  if (!date) return 'Just now';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  const fetchRealNotifications = async () => {
    try {
      const [jobsRes, profileRes, certsRes] = await Promise.allSettled([
        api.get('/jobs'),
        api.get('/profile'),
        api.get('/certificates')
      ]);

      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : [];
      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data?.profile : null;
      const certs = certsRes.status === 'fulfilled' ? certsRes.value.data : [];

      const list = [];
      let idCounter = 1;

      // 1. Profile incomplete
      const percent = profile?.completion_percent ?? 0;
      if (percent < 100) {
        const notifId = `profile_${percent}`;
        list.push({
          id: notifId,
          type: 'profile',
          icon: '👤',
          iconBg: 'rgba(99,102,241,0.15)',
          title: 'Complete your profile',
          desc: `Your profile is only ${percent}% complete. Add more details to improve visibility.`,
          time: new Date(profile?.created_at || Date.now() - 24 * 60 * 60 * 1000),
          read: localStorage.getItem(`notif_read_${notifId}`) === 'true',
        });
      }

      // 2. Certificates expiring soon
      certs.forEach((cert) => {
        if (cert.expiry_date) {
          const expiry = new Date(cert.expiry_date);
          const diffTime = expiry - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0 && diffDays <= 60) {
            const notifId = `cert_${cert.id}_${cert.expiry_date}`;
            list.push({
              id: notifId,
              type: 'certificate',
              icon: '🏆',
              iconBg: 'rgba(16,185,129,0.15)',
              title: 'Certificate expiring soon',
              desc: `Your "${cert.title}" certificate expires in ${diffDays} days.`,
              time: new Date(cert.created_at || Date.now() - 12 * 60 * 60 * 1000),
              read: localStorage.getItem(`notif_read_${notifId}`) === 'true',
            });
          }
        }
      });

      // 3. Job status changed or follow-up suggestions
      jobs.forEach((job) => {
        if (job.status === 'Interview') {
          const notifId = `job_interview_${job.id}`;
          list.push({
            id: notifId,
            type: 'job_status',
            icon: '💼',
            iconBg: 'rgba(59,130,246,0.15)',
            title: 'Interview Scheduled',
            desc: `Your application at ${job.company} for "${job.position}" is in the Interview stage.`,
            time: new Date(job.created_at || Date.now() - 4 * 60 * 60 * 1000),
            read: localStorage.getItem(`notif_read_${notifId}`) === 'true',
          });
        } else if (job.status === 'Offered') {
          const notifId = `job_offered_${job.id}`;
          list.push({
            id: notifId,
            type: 'job_status',
            icon: '🎉',
            iconBg: 'rgba(34,197,94,0.15)',
            title: 'Offer received!',
            desc: `Congratulations! ${job.company} marked your application for "${job.position}" as Offered.`,
            time: new Date(job.created_at || Date.now() - 6 * 60 * 60 * 1000),
            read: localStorage.getItem(`notif_read_${notifId}`) === 'true',
          });
        }

        // Add follow-up suggestion for any job that is still 'Applied' and was created a week ago
        if (job.status === 'Applied') {
          const applied = new Date(job.applied_date || job.created_at);
          const diffTime = new Date() - applied;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 7) {
            const notifId = `job_followup_${job.id}_${diffDays}`;
            list.push({
              id: notifId,
              type: 'followup',
              icon: '📅',
              iconBg: 'rgba(234,179,8,0.15)',
              title: 'Follow-up suggestion',
              desc: `It has been ${diffDays} days since you applied to ${job.company} for "${job.position}". Consider sending a follow-up email.`,
              time: new Date(job.created_at || Date.now() - 8 * 60 * 60 * 1000),
              read: localStorage.getItem(`notif_read_${notifId}`) === 'true',
            });
          }
        }
      });

      // Default notification if list is empty, to ensure the UI remains interactive
      if (list.length === 0) {
        list.push({
          id: 'welcome_placeholder',
          type: 'profile',
          icon: '✨',
          iconBg: 'rgba(99,102,241,0.15)',
          title: 'Welcome to CareerCraft AI',
          desc: 'Start adding your skills, courses, certificates, and applications to get live reminders.',
          time: new Date(),
          read: localStorage.getItem('notif_read_welcome_placeholder') === 'true',
        });
      }

      setNotifications(list);
    } catch (err) {
      console.error('Failed to construct dynamic notifications:', err);
    }
  };

  useEffect(() => {
    fetchRealNotifications();
    
    // Periodically update dynamic notifications every 30 seconds
    const interval = setInterval(fetchRealNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      fetchRealNotifications();
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markAllRead = () => {
    notifications.forEach((n) => {
      localStorage.setItem(`notif_read_${n.id}`, 'true');
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    localStorage.setItem(`notif_read_${id}`, 'true');
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        className="icon-btn notif-bell"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
        id="notifications-bell"
      >
        <RiNotification3Line size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-all" onClick={markAllRead}>
                <RiCheckDoubleLine size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <RiNotification3Line size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markRead(notif.id)}
                >
                  <div
                    className="notif-icon"
                    style={{ background: notif.iconBg, fontSize: 18 }}
                  >
                    {notif.icon}
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-desc">{notif.desc}</div>
                    <div className="notif-time">
                      <RiTimeLine size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {timeAgo(notif.time)}
                    </div>
                  </div>
                  {!notif.read && <div className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
