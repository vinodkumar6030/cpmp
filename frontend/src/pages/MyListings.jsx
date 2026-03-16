import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MyListings() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/my');
      setProducts(res.data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleSold = async (id) => {
    setActionId(id);
    try { await api.patch(`/products/${id}/sold`); fetchListings(); }
    catch { /* ignore */ }
    finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    setActionId(id);
    try { await api.delete(`/products/${id}`); fetchListings(); }
    catch { /* ignore */ }
    finally { setActionId(null); }
  };

  const getImg = (p) => {
    try { const imgs = JSON.parse(p.images || '[]'); return imgs[0] ? `https://cpmp.onrender.com${imgs[0]}` : null; }
    catch { return null; }
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    sold: products.filter(p => p.status === 'sold').length,
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>📦 My Listings</h1>
          <button className="btn btn-primary" onClick={() => navigate('/create-listing')}>+ New Listing</button>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Listings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--secondary)' }}>{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--text-muted)' }}>{stats.sold}</div>
            <div className="stat-label">Sold</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No listings yet</h3>
            <p>Start selling by listing your first item.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/create-listing')}>Create Listing</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {products.map(p => {
              const img = getImg(p);
              return (
                <div key={p.id} className="listing-row">
                  <div className="listing-thumb">
                    {img ? <img src={img} alt={p.title} /> : '📦'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/products/${p.id}`)}>{p.title}</p>
                    <div className="flex items-center gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                      <span className={`badge ${p.status === 'sold' ? 'badge-danger' : 'badge-success'}`}>{p.status === 'sold' ? 'Sold' : 'Active'}</span>
                      <span className="badge badge-muted">{p.category}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="listing-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/products/${p.id}`)}>View</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit-listing/${p.id}`)}>Edit</button>
                    <button
                      className={`btn btn-sm ${p.status === 'sold' ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleSold(p.id)}
                      disabled={actionId === p.id}
                    >
                      {p.status === 'sold' ? 'Relist' : '✓ Mark Sold'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)} disabled={actionId === p.id}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
