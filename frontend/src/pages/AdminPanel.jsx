import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ users: 0, products: 0, pendingReports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [tab]);

  const fetchStats = async () => {
    try { const res = await api.get('/admin/stats'); setStats(res.data); } catch { /* ignore */ }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'users') { const res = await api.get('/admin/users'); setUsers(res.data); }
      else if (tab === 'products') { const res = await api.get('/admin/products'); setProducts(res.data); }
      else if (tab === 'reports') { const res = await api.get('/admin/reports'); setReports(res.data); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const toggleSuspend = async (id) => {
    try { await api.patch(`/admin/users/${id}/suspend`); fetchData(); } catch { /* ignore */ }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try { await api.delete(`/admin/products/${id}`); fetchData(); fetchStats(); } catch { /* ignore */ }
  };

  const resolveReport = async (id) => {
    try { await api.patch(`/admin/reports/${id}/resolve`); fetchData(); fetchStats(); } catch { /* ignore */ }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚡ Admin Panel</h1>
        <p className="text-secondary mb-3">Manage users, listings, and reports.</p>

        {/* Stats */}
        <div className="dashboard-stats mb-3">
          <div className="stat-card">
            <div className="stat-number">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: stats.pendingReports > 0 ? 'var(--danger)' : 'var(--secondary)' }}>{stats.pendingReports}</div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[{ key: 'users', label: '👥 Users' }, { key: 'products', label: '📦 Products' }, { key: 'reports', label: `🚩 Reports${stats.pendingReports > 0 ? ` (${stats.pendingReports})` : ''}` }].map(t => (
            <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
            {/* Users tab */}
            {tab === 'users' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Dept.</th><th>Year</th><th>Status</th><th>Role</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.year || '—'}</td>
                      <td>
                        {u.isSuspended
                          ? <span className="badge badge-danger">Suspended</span>
                          : u.isVerified ? <span className="badge badge-success">Active</span>
                          : <span className="badge badge-warning">Unverified</span>
                        }
                      </td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-muted'}`}>{u.role}</span></td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className={`btn btn-sm ${u.isSuspended ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleSuspend(u.id)}>
                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>}
                </tbody>
              </table>
            )}

            {/* Products tab */}
            {tab === 'products' && (
              <table className="admin-table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Price</th><th>Seller</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.seller?.name}</td>
                      <td><span className={`badge ${p.status === 'sold' ? 'badge-danger' : 'badge-success'}`}>{p.status}</span></td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No products found</td></tr>}
                </tbody>
              </table>
            )}

            {/* Reports tab */}
            {tab === 'reports' && (
              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Reported By</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.product?.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.reporter?.name}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 250 }}>{r.reason}</td>
                      <td><span className={`badge ${r.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => resolveReport(r.id)}>Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reports found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
