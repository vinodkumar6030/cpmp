import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'MBA', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG', 'PhD'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', department: '', year: '', phone: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', department: user.department || '', year: user.year || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    const fd = new FormData();
    fd.append('profilePhoto', photoFile);
    try {
      const res = await api.post('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ profilePhoto: res.data.profilePhoto });
      setSuccess('Profile photo updated!');
    } catch {
      setError('Failed to upload photo');
    }
    setPhotoFile(null);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const photoSrc = photoPreview || (user?.profilePhoto ? `https://cpmp.onrender.com${user.profilePhoto}` : null);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>👤 My Profile</h1>

        {success && <div className="alert alert-success mb-2">{success}</div>}
        {error && <div className="alert alert-error mb-2">{error}</div>}

        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-photo" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => document.getElementById('photo-input').click()}>
            {photoSrc ? <img src={photoSrc} alt="Profile" /> : initials}
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📷</div>
            <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginTop: '0.4rem' }}>{user?.role === 'admin' ? '⚡ Admin' : '🎓 Student'}</span>
            {photoFile && (
              <div style={{ marginTop: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" onClick={handlePhotoUpload}>Upload Photo</button>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }} onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem' }}>Edit Information</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">College Email</label>
                <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <span className="form-hint">Email cannot be changed</span>
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
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
