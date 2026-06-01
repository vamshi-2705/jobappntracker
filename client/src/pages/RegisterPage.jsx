import { motion } from 'framer-motion';
import { RiRocketLine, RiShieldCheckLine, RiTeamLine } from 'react-icons/ri';
import Register from '../components/Auth/Register';

const FEATURES = [
  { icon: RiRocketLine, text: 'Launch your career journey today' },
  { icon: RiShieldCheckLine, text: 'Secure profile & credential vault' },
  { icon: RiTeamLine, text: 'Built for students & professionals' },
];

const RegisterPage = () => (
  <div className="auth-split">
    <div className="auth-split-left">
      <div className="sidebar-logo" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>
        <RiRocketLine />
      </div>
      <h1>Join JobTrackr AI</h1>
      <p style={{ opacity: 0.9, fontSize: 'var(--text-lg)', margin: 0 }}>
        Start organizing your job search with confidence
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
        <Register />
      </motion.div>
    </div>
  </div>
);

export default RegisterPage;
