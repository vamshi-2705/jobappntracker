import { Link } from 'react-router-dom';
import ResumeBuilder from '../components/Resume/ResumeBuilder';

const ResumePage = () => (
  <div className="dashboard">
    <p className="ai-hint">
      Uses your profile, education, experience, skills, and certificates.{' '}
      <Link to="/profile">Complete your profile</Link> for best results.
    </p>
    <ResumeBuilder />
  </div>
);

export default ResumePage;
