import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Cycles', 'Accessories', 'Others'];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: 'Used', location: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data;
        setForm({ title: p.title, description: p.description, price: p.price, category: p.category, condition: p.condition, location: p.location || '' });
        try { setExistingImages(JSON.parse(p.images || '[]')); } catch { setExistingImages([]); }
      })
      .catch(() => navigate('/my-listings'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (newFiles) => {
    const selected = Array.from(newFiles).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));
      await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center page-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>✏️ Edit Listing</h1>
        </div>
        {error && <div className="alert alert-error mb-2">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="form-group">
              <label className="form-label">Current Images</label>
              <div className="image-preview-grid">
                {existingImages.map((src, i) => (
                  <div key={i} className="image-preview">
                    <img src={`https://cpmp.onrender.com${src}`} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Replace Images (optional)</label>
            <div className="image-upload-area" style={{ padding: '1.5rem' }} onClick={() => document.getElementById('edit-img-input').click()}>
              <p>Click to select new images</p>
              <input id="edit-img-input" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div className="image-preview-grid">
                {previews.map((src, i) => <div key={i} className="image-preview"><img src={src} alt="" /></div>)}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-control" name="condition" value={form.condition} onChange={handleChange}>
                <option>New</option><option>Used</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" name="location" value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
