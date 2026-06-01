import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RiLockLine, RiMailLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const toastId = toast.loading('Signing in...');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!', { id: toastId });
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Welcome back</h2>
      <p className="auth-subtitle">Sign in to track your job applications</p>

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

      <Input
        label="Password"
        name="password"
        type="password"
        icon={RiLockLine}
        value={form.password}
        onChange={handleChange}
        placeholder="Your password"
        required
        autoComplete="current-password"
        error={error || undefined}
      />

      <Button type="submit" variant="primary" size="lg" block loading={loading}>
        Sign in
      </Button>

      <p className="auth-footer">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
};

export default Login;
