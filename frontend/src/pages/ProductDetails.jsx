import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import WishlistButton from '../components/WishlistButton';
import { useToast } from '../components/Toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [payModal, setPayModal] = useState(false);
  const [payStep, setPayStep] = useState('choose'); // 'choose' | 'upi' | 'cod' | 'success'
  const [upiId, setUpiId] = useState('');

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

  const openPayModal = () => {
    if (!user) return navigate('/login');
    setPayStep('choose');
    setUpiId('');
    setPayModal(true);
  };

  /* ── UPI Deep Link ── */
  const handleUpiPay = () => {
    if (!product) return;
    const amount = Number(product.price).toFixed(2);
    // Seller UPI = seller phone@upi (or a fallback). Real UPI would be stored in seller profile.
    const sellerUpi = product.seller?.phone
      ? `${product.seller.phone}@upi`
      : 'campusmarket@upi';
    const note = encodeURIComponent(`Payment for ${product.title}`);
    // UPI deep link — opens GPay / PhonePe / Paytm on mobile
    const upiLink = `upi://pay?pa=${sellerUpi}&pn=${encodeURIComponent(product.seller?.name || 'Seller')}&am=${amount}&cu=INR&tn=${note}`;
    window.location.href = upiLink;
    // After a short delay show success fallback (UPI app handles actual payment)
    setTimeout(() => {
      setPayStep('success');
      addToast('UPI app opened! Complete payment there.', 'success');
    }, 1500);
  };

  const handleCOD = () => {
    setPayStep('cod');
  };

  const closePay = () => {
    setPayModal(false);
    setPayStep('choose');
  };

  if (loading) return <div className="loading-center page-wrapper"><div className="spinner" /></div>;
  if (!product) return null;

  const isMine = user?.id === product.sellerId;
  const seller = product.seller;
  const sellerInitials = seller?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

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
                ? <img src={`https://cpmp.onrender.com${images[activeImg]}`} alt={product.title} />
                : <span style={{ fontSize: '4rem' }}>📦</span>
              }
            </div>
            {images.length > 1 && (
              <div className="product-thumbs">
                {images.map((img, i) => (
                  <img key={i} className={`product-thumb ${i === activeImg ? 'active' : ''}`} src={`https://cpmp.onrender.com${img}`} alt="" onClick={() => setActiveImg(i)} />
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.title}</h1>
                <WishlistButton productId={product.id} />
              </div>
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
                  ? <img src={`https://cpmp.onrender.com${seller.profilePhoto}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
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
                <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={openPayModal}>
                  💳 Buy Now
                </button>
                {seller?.phone && (
                  <a href={`tel:${seller.phone}`} className="btn btn-secondary btn-lg">📞 Call</a>
                )}
              </div>
            )}

            {/* Payment method info strip */}
            {!isMine && product.status !== 'sold' && (
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="pay-badge">🏦 UPI (GPay / PhonePe / Paytm)</span>
                <span className="pay-badge">📦 Cash on Delivery</span>
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

      {/* ── Payment Modal ── */}
      {payModal && (
        <div className="modal-backdrop" onClick={closePay}>
          <div className="modal animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>

            {payStep === 'choose' && (
              <>
                <h3 style={{ marginBottom: '0.3rem' }}>💳 Choose Payment Method</h3>
                <p className="text-sm text-muted mb-2">You are buying: <strong style={{ color: 'var(--text-primary)' }}>{product.title}</strong></p>
                <div className="pay-price-tag">₹{Number(product.price).toLocaleString('en-IN')}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem' }}>
                  {/* UPI Option */}
                  <button className="pay-option-btn" onClick={() => setPayStep('upi')}>
                    <div className="pay-option-icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}>📱</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>UPI Payment</div>
                      <div className="text-sm text-muted">GPay · PhonePe · Paytm · BHIM</div>
                    </div>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>→</span>
                  </button>

                  {/* Cash on Delivery */}
                  <button className="pay-option-btn" onClick={handleCOD}>
                    <div className="pay-option-icon" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>💵</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>Cash on Delivery</div>
                      <div className="text-sm text-muted">Pay in cash when you meet the seller</div>
                    </div>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>→</span>
                  </button>
                </div>

                <button className="btn btn-secondary btn-sm mt-2" style={{ width: '100%' }} onClick={closePay}>Cancel</button>
              </>
            )}

            {payStep === 'upi' && (
              <>
                <h3 style={{ marginBottom: '0.3rem' }}>📱 Pay via UPI</h3>
                <p className="text-sm text-muted mb-1">Amount: <strong style={{ color: 'var(--secondary)' }}>₹{Number(product.price).toLocaleString('en-IN')}</strong></p>

                <div className="upi-apps-row">
                  {[
                    { name: 'GPay', icon: '🟢', link: `gpay://upi/pay?pa=${product.seller?.phone || ''}@upi&am=${product.price}&tn=${encodeURIComponent(product.title)}` },
                    { name: 'PhonePe', icon: '🟣', link: `phonepe://pay?pa=${product.seller?.phone || ''}@upi&am=${product.price}` },
                    { name: 'Paytm', icon: '🔵', link: `paytmmp://pay?pa=${product.seller?.phone || ''}@paytm&am=${product.price}` },
                    { name: 'BHIM', icon: '🟠', link: `bhim://pay?pa=${product.seller?.phone || ''}@upi&am=${product.price}` },
                  ].map(app => (
                    <a
                      key={app.name}
                      href={app.link}
                      className="upi-app-btn"
                      onClick={() => {
                        setTimeout(() => { setPayStep('success'); }, 1000);
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{app.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{app.name}</span>
                    </a>
                  ))}
                </div>

                <div style={{ margin: '0.8rem 0', borderTop: '1px solid var(--bg-glass-border)', paddingTop: '0.8rem' }}>
                  <p className="text-sm text-muted mb-1">Or pay with any UPI ID:</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="form-control"
                      placeholder="Enter seller UPI ID (e.g. name@gpay)"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      style={{ flex: 1, fontSize: '0.9rem' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleUpiPay}
                    >
                      Pay
                    </button>
                  </div>
                </div>

                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setPayStep('choose')}>← Back</button>
              </>
            )}

            {payStep === 'cod' && (
              <>
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>📦</div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Cash on Delivery Confirmed!</h3>
                  <p className="text-secondary" style={{ marginBottom: '1.2rem' }}>
                    Great! You've chosen to pay <strong style={{ color: 'var(--secondary)' }}>₹{Number(product.price).toLocaleString('en-IN')}</strong> in cash when you meet the seller.
                  </p>

                  <div className="cod-info-box">
                    <div className="cod-step"><span>1️⃣</span><span>Chat with the seller to arrange meeting</span></div>
                    <div className="cod-step"><span>2️⃣</span><span>Inspect the item before paying</span></div>
                    <div className="cod-step"><span>3️⃣</span><span>Pay the exact amount in cash</span></div>
                  </div>

                  {seller?.phone && (
                    <a href={`tel:${seller.phone}`} className="btn btn-success btn-lg mt-2" style={{ display: 'inline-flex' }}>
                      📞 Call Seller to Arrange Meet
                    </a>
                  )}

                  <button className="btn btn-primary btn-lg mt-2" style={{ display: 'inline-flex', marginLeft: '0.5rem' }} onClick={() => { closePay(); navigate(`/messages/${product.id}/${product.sellerId}`); }}>
                    💬 Chat with Seller
                  </button>
                </div>
                <button className="btn btn-secondary btn-sm mt-2" style={{ width: '100%' }} onClick={closePay}>Close</button>
              </>
            )}

            {payStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem', animation: 'scaleIn 0.3s ease' }}>🎉</div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>Payment Initiated!</h3>
                <p className="text-secondary" style={{ marginBottom: '1.2rem' }}>
                  Your UPI app should have opened. Complete the payment of <strong style={{ color: 'var(--secondary)' }}>₹{Number(product.price).toLocaleString('en-IN')}</strong> there, then message the seller.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => { closePay(); navigate(`/messages/${product.id}/${product.sellerId}`); }}>
                  💬 Message Seller
                </button>
                <button className="btn btn-secondary mt-1" style={{ display: 'block', width: '100%' }} onClick={closePay}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

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
