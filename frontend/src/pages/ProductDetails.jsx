import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMsg, setReportMsg] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        try { setImages(JSON.parse(res.data.images || '[]')); } catch { setImages([]); }
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = () => {
    if (!user) return navigate('/login');
    navigate(`/messages/${product.id}/${product.sellerId}`);
  };

  const handleReport = async () => {
    try {
      await api.post('/reports', { productId: product.id, reason: reportReason });
      setReportMsg('Report submitted. Thank you!');
      setTimeout(() => { setReportModal(false); setReportMsg(''); setReportReason(''); }, 2000);
    } catch (err) {
      setReportMsg(err.response?.data?.message || 'Failed to submit report.');
    }
  };

  if (loading) return <div className="loading-center page-wrapper"><div className="spinner" /></div>;
  if (!product) return null;

  const isMine = user?.id === product.sellerId;
  const seller = product.seller;
  const sellerInitials = seller?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Breadcrumb */}
        <p className="text-sm text-muted mb-2"><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> / {product.category} / {product.title}</p>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-img">
              {images[activeImg]
                ? <img src={`http://localhost:5000${images[activeImg]}`} alt={product.title} />
                : <span style={{ fontSize: '4rem' }}>📦</span>
              }
            </div>
            {images.length > 1 && (
              <div className="product-thumbs">
                {images.map((img, i) => (
                  <img key={i} className={`product-thumb ${i === activeImg ? 'active' : ''}`} src={`http://localhost:5000${img}`} alt="" onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info animate-slide">
            <div>
              <div className="flex items-center gap-1 mb-1" style={{ flexWrap: 'wrap' }}>
                <span className={`badge ${product.condition === 'New' ? 'badge-success' : 'badge-muted'}`}>{product.condition}</span>
                <span className="badge badge-primary">{product.category}</span>
                {product.status === 'sold' && <span className="badge badge-danger">SOLD</span>}
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.title}</h1>
              <div className="product-price-big">₹{Number(product.price).toLocaleString('en-IN')}</div>
            </div>

            {product.location && (
              <p className="text-secondary text-sm">📍 {product.location}</p>
            )}

            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{product.description}</p>
            </div>

            {/* Seller Card */}
            <div className="seller-card">
              <div className="seller-avatar">
                {seller?.profilePhoto
                  ? <img src={`http://localhost:5000${seller.profilePhoto}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  : sellerInitials
                }
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{seller?.name}</p>
                <p className="text-sm text-muted">{seller?.department}{seller?.year && ` · ${seller.year}`}</p>
              </div>
            </div>

            {/* Actions */}
            {!isMine && product.status !== 'sold' && (
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleContact}>
                  💬 Chat with Seller
                </button>
                {seller?.phone && (
                  <a href={`tel:${seller.phone}`} className="btn btn-secondary btn-lg">📞 Call</a>
                )}
              </div>
            )}
            {isMine && (
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => navigate(`/edit-listing/${product.id}`)}>✏️ Edit</button>
              </div>
            )}
            {!isMine && user && (
              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => setReportModal(true)}>🚩 Report this listing</button>
            )}
            <p className="text-sm text-muted">Listed {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="modal-backdrop" onClick={() => setReportModal(false)}>
          <div className="modal animate-scale" onClick={(e) => e.stopPropagation()}>
            <h3>🚩 Report Listing</h3>
            <p className="text-secondary text-sm mb-2">Tell us what's wrong with this listing.</p>
            {reportMsg && <div className={`alert ${reportMsg.includes('submitted') ? 'alert-success' : 'alert-error'} mb-2`}>{reportMsg}</div>}
            <textarea className="form-control mb-2" rows={4} placeholder="Describe the issue..." value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setReportModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReport} disabled={!reportReason.trim()}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
