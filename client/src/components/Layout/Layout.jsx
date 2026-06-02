import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageMotion from '../UI/PageMotion';
import { DashboardSkeleton } from '../UI/Skeleton';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/skills': 'Skills',
  '/certificates': 'Certificates',
  '/jobs': 'Jobs',
  '/resume': 'Resume Builder',
  '/interview': 'Interview Prep',
  '/notes': 'Notes',
  '/settings': 'Settings',
};

const Layout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const title = TITLES[location.pathname] || 'CareerCraft AI';

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Navbar title={title} breadcrumb="Home / App" onMenuClick={() => setMobileOpen((v) => !v)} />
        <div className="page-content">
          <PageMotion key={location.pathname}>
            <Outlet />
          </PageMotion>
        </div>
      </div>
    </div>
  );
};

export default Layout;
