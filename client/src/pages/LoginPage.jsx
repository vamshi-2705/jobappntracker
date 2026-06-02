import { motion } from 'framer-motion';
import { RiBriefcaseLine, RiFileTextLine, RiSparklingLine } from 'react-icons/ri';
import Login from '../components/Auth/Login';

const FEATURES = [
  { icon: RiBriefcaseLine, text: 'Track every application in one place' },
  { icon: RiFileTextLine, text: 'AI resume match & cover letters' },
  { icon: RiSparklingLine, text: 'Interview prep powered by AI' },
];

const LoginPage = () => (
  <div className="auth-split">
    <div className="auth-split-left">
      <div className="sidebar-logo" style={{ width: 64, height: 64, background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="CareerCraft AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '16px 0 8px', background: 'linear-gradient(135deg, #60a5fa 0%, #2dd4bf 50%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        CareerCraft AI
      </h1>
      <p style={{ opacity: 0.9, fontSize: 'var(--text-lg)', margin: 0, color: '#e2e8f0' }}>
        Your smart companion for the job search
      </p>
      <ul className="auth-feature-list">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text}>
            <Icon size={24} />
            {text}
          </li>
        ))}
      </ul>
    </div>
    <div className="auth-split-right">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Login />
      </motion.div>
    </div>
  </div>
);

export default LoginPage;
