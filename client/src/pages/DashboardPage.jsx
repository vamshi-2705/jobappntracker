import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiBriefcaseLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiQuestionAnswerLine,
} from 'react-icons/ri';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AnimatedCounter from '../components/UI/AnimatedCounter';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import PageHeader from '../components/UI/PageHeader';
import { DashboardSkeleton } from '../components/UI/Skeleton';

const STATUS_COLORS = {
  Applied: '#6366f1',
  Interview: '#f59e0b',
  Offered: '#10b981',
  Rejected: '#ef4444',
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, jobsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/jobs'),
        ]);
        setSummary(summaryRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(
    () => ({
      applied: jobs.filter((j) => j.status === 'Applied').length,
      interview: jobs.filter((j) => j.status === 'Interview').length,
      offered: jobs.filter((j) => j.status === 'Offered').length,
      rejected: jobs.filter((j) => j.status === 'Rejected').length,
    }),
    [jobs]
  );

  const statusChart = useMemo(
    () =>
      Object.entries(STATUS_COLORS).map(([name, fill]) => ({
        name,
        value: jobs.filter((j) => j.status === name).length,
        fill,
      })),
    [jobs]
  );

  const timelineChart = useMemo(() => {
    const map = {};
    jobs.forEach((j) => {
      if (!j.applied_date) return;
      const key = new Date(j.applied_date).toLocaleDateString(undefined, {
        month: 'short',
        year: '2-digit',
      });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [jobs]);

  const recentJobs = jobs.slice(0, 5);

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    {
      key: 'applied',
      label: 'Total Applied',
      value: summary?.totalJobs ?? jobs.length,
      variant: 'primary',
      icon: RiBriefcaseLine,
    },
    {
      key: 'interview',
      label: 'Interviews',
      value: stats.interview,
      variant: 'accent',
      icon: RiQuestionAnswerLine,
    },
    {
      key: 'offered',
      label: 'Offers',
      value: stats.offered,
      variant: 'success',
      icon: RiCheckboxCircleLine,
    },
    {
      key: 'rejected',
      label: 'Rejections',
      value: stats.rejected,
      variant: 'danger',
      icon: RiCloseCircleLine,
    },
  ];

  return (
    <div className="dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here is your job search overview."
      />

      <div className="stat-grid">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            className={`stat-card-v2 ${card.variant === 'accent' ? 'accent' : ''} ${card.variant === 'success' ? 'success' : ''} ${card.variant === 'danger' ? 'danger' : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className={`stat-icon-wrap ${card.variant}`}>
              <card.icon size={24} />
            </div>
            <div>
              <div className="stat-value">
                <AnimatedCounter value={card.value} />
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="chart-grid">
        <Card className="chart-card" hover>
          <h3>Applications over time</h3>
          {timelineChart.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timelineChart}>
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-inline">Add jobs with applied dates to see trends.</p>
          )}
        </Card>

        <Card className="chart-card" hover>
          <h3>Status breakdown</h3>
          {jobs.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {statusChart.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-inline">No applications yet.</p>
          )}
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <Card>
          <div className="section-header">
            <h3 style={{ margin: 0 }}>Recent applications</h3>
            <Link to="/jobs">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          {!recentJobs.length && <p className="empty-inline">No jobs tracked yet.</p>}
          <ul className="activity-list-v2">
            {recentJobs.map((job) => (
              <li key={job.id}>
                <span>
                  <strong>{job.position}</strong> · {job.company}
                </span>
                <Badge variant={job.status === 'Offered' ? 'success' : job.status === 'Rejected' ? 'danger' : job.status === 'Interview' ? 'warning' : 'primary'}>
                  {job.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="tip-card-v2 profile-ring-wrap">
          <h3 style={{ marginTop: 0 }}>Profile completion</h3>
          <div className="profile-ring">
            <svg viewBox="0 0 100 100" width="100" height="100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gray-200)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeDasharray={`${(summary?.profileCompletion || 0) * 2.64} 264`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)">
                {summary?.profileCompletion ?? 0}%
              </text>
            </svg>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Complete your profile to unlock better AI recommendations.
          </p>
          <Link to="/profile">
            <Button variant="primary" block>
              Complete profile
            </Button>
          </Link>
          {summary?.tipOfTheDay && (
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 8px' }}>Tip of the day</h4>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {summary.tipOfTheDay}
              </p>
            </div>
          )}
        </Card>
      </div>

      {summary?.recentActivity?.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <h3>Recent activity</h3>
          <ul className="activity-list-v2">
            {summary.recentActivity.map((item, i) => (
              <li key={i}>
                <span>{item.message}</span>
                <time style={{ color: 'var(--text-secondary)' }}>
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
