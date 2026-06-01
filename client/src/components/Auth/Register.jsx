import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RiLockLine, RiMailLine, RiUserLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const strengthColor = (score) => {
  if (score <= 1) return 'var(--danger)';
  if (score === 2) return 'var(--accent)';
  if (score === 3) return 'var(--primary)';
  return 'var(--secondary)';
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwdScore = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s += 1;
    if (p.length >= 10) s += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s += 1;
    if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s += 1;
    return s;
  }, [form.password]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    const toastId = toast.loading('Creating account...');
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!', { id: toastId });
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      <p className="auth-subtitle">Start tracking applications with AI tools</p>

      <div className="form-grid">
        <Input
          label="Full name"
          name="name"
          icon={RiUserLine}
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          icon={RiMailLine}
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <Input
        label="Password"
        name="password"
        type="password"
        icon={RiLockLine}
        value={form.password}
        onChange={handleChange}
        placeholder="At least 6 characters"
        required
        autoComplete="new-password"
        error={error && !form.confirmPassword ? error : undefined}
      />
      {form.password && (
        <div className="password-strength">
          <div
            className="password-strength-bar"
            style={{
              width: `${(pwdScore / 4) * 100}%`,
              background: strengthColor(pwdScore),
            }}
          />
        </div>
      )}

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        icon={RiLockLine}
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Repeat password"
        required
        autoComplete="new-password"
        error={error && form.confirmPassword ? error : undefined}
      />

      <Button type="submit" variant="primary" size="lg" block loading={loading}>
        Create account
      </Button>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
};

export default Register;
