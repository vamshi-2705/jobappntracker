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
      <div className="sidebar-logo" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>
        <RiBriefcaseLine />
      </div>
      <h1>JobTrackr AI</h1>
      <p style={{ opacity: 0.9, fontSize: 'var(--text-lg)', margin: 0 }}>
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
