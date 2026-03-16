import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'MBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG', 'PhD'];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '', year: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
        department: form.department, year: form.year, phone: form.phone
      });
      setSuccess('🎉 Registration successful! Check your email (or the backend console in dev mode) for a verification link.');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Server error occurred');
      } else if (err.request) {
        setError('Unable to connect to the server. Please try again.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-slide" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2>Check Your Email!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{success}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h1>Join Campus Market</h1>
          <p className="subtitle">Register with your college email</p>
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@gmail.com" />
            <span className="form-hint">A verification link will be sent here</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" name="department" value={form.department} onChange={handleChange}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select className="form-control" name="year" value={form.year} onChange={handleChange}>
                <option value="">Select...</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-control" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Retype password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
