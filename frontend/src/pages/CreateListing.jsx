import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Cycles', 'Accessories', 'Others'];

export default function CreateListing() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: 'Used', location: '' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (newFiles) => {
    const selected = Array.from(newFiles).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => {
    const newFiles = files.filter((_, idx) => idx !== i);
    const newPreviews = previews.filter((_, idx) => idx !== i);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.price || !form.category) return setError('Title, price, and category are required.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));
      const res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('🎉 Listing published! Check your email for confirmation.', 'success', 5000);
      navigate(`/products/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700, paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>📦 Create New Listing</h1>
          <p className="text-secondary">Fill in the details to sell your item on campus.</p>
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Images */}
          <div className="form-group">
            <label className="form-label">Product Images (up to 5)</label>
            <div
              className="image-upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('img-input').click()}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <p>Drag & drop images here, or click to select</p>
              <p className="text-sm text-muted">PNG, JPG, WebP · Max 5MB each</p>
              <input id="img-input" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div className="image-preview-grid">
                {previews.map((src, i) => (
                  <div key={i} className="image-preview">
                    <img src={src} alt="" />
                    <button type="button" className="image-preview-remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Product Title *</label>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. HP Laptop Core i5 2022" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the product, its condition, included accessories, etc." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="e.g. 5000" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-control" name="condition" value={form.condition} onChange={handleChange}>
                <option>New</option>
                <option>Used</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location on Campus</label>
              <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Hostel Block B" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Publishing...' : '🚀 Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
