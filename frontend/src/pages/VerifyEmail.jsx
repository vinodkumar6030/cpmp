import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide" style={{ textAlign: 'center' }}>
        {status === 'loading' && <><div className="spinner" style={{ margin: '0 auto 1rem' }} /><p>Verifying your email...</p></>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{message}</p>
            <Link to="/login" className="btn btn-primary">Sign In Now</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{message}</p>
            <Link to="/signup" className="btn btn-secondary">Back to Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}
