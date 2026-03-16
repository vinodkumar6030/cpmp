import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide" style={{ textAlign: done ? 'center' : 'left' }}>
        {done ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <h2>Check Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. Check the backend console in dev mode.
            </p>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1>Forgot Password?</h1>
              <p className="subtitle">Enter your college email and we'll send a reset link.</p>
            </div>
            {error && <div className="alert alert-error mb-2">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">College Email</label>
                <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@college.edu.in" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-divider" style={{ marginTop: '1rem' }}><Link to="/login">← Back to Login</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
