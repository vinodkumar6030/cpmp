import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import WishlistButton from '../components/WishlistButton';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Cycles', 'Accessories', 'Others'];
const CONDITIONS = ['All', 'New', 'Used'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const CATEGORY_ICONS = { Electronics: '💻', Books: '📚', Furniture: '🛋️', Cycles: '🚲', Accessories: '👜', Others: '📦', All: '🛒' };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [sort, setSort] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, condition, sort, searchQuery, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (searchQuery) params.search = searchQuery;
      if (category !== 'All') params.category = category;
      if (condition !== 'All') params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImg = (product) => {
    try {
      const imgs = JSON.parse(product.images);
      return imgs[0] ? `https://cpmp.onrender.com${imgs[0]}` : null;
    } catch { return null; }
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="hero container">
        <h1>Campus Marketplace 🎓</h1>
        <p>Buy and sell used items within your campus — safe, simple, and student-only.</p>
      </div>

      <div className="container">
        {/* Category Chips */}
        <div className="category-bar mb-3">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`category-chip ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Filters:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label>Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label>Min ₹</label>
            <input type="number" className="form-control" style={{ width: 90, padding: '0.3rem 0.7rem', fontSize: '0.85rem' }} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label>Max ₹</label>
            <input type="number" className="form-control" style={{ width: 90, padding: '0.3rem 0.7rem', fontSize: '0.85rem' }} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="∞" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <label>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-secondary text-sm">
            {searchQuery && <span>Results for "<strong>{searchQuery}</strong>" · </span>}
            {loading ? 'Loading...' : `${products.length} item${products.length !== 1 ? 's' : ''} found`}
          </p>
          <Link to="/create-listing" className="btn btn-primary btn-sm">+ List an Item</Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="product-grid animate-fade">
            {products.map(p => {
              const img = getImg(p);
              return (
                <div key={p.id} className="product-card" onClick={() => navigate(`/products/${p.id}`)} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2 }}>
                  <WishlistButton productId={p.id} />
                </div>

                  <div className="product-card-image">
                    {img ? <img src={img} alt={p.title} /> : CATEGORY_ICONS[p.category] || '📦'}
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-title">{p.title}</div>
                    <div className="product-card-price">₹{Number(p.price).toLocaleString('en-IN')}</div>
                    <div className="product-card-meta">
                      <span className={`badge ${p.condition === 'New' ? 'badge-success' : 'badge-muted'}`}>{p.condition}</span>
                      <span className="badge badge-primary">{p.category}</span>
                      {p.location && <span className="badge badge-muted">📍 {p.location}</span>}
                    </div>
                    <p className="text-sm text-muted mt-1">by {p.seller?.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: '4rem' }} />
      </div>
    </div>
  );
}
