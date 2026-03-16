import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🏪</div>
          <span>CampusMarket</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Browse</Link>
          {user ? (
            <>
              <Link to="/create-listing" className="btn btn-primary btn-sm">+ Sell</Link>
              <Link to="/messages" className="nav-link">💬 Chats</Link>
              <Link to="/my-listings" className="nav-link">My Listings</Link>
              {isAdmin && <Link to="/admin" className="nav-link" style={{ color: 'var(--warning)' }}>⚡ Admin</Link>}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {user.profilePhoto ? <img src={`https://cpmp.onrender.com${user.profilePhoto}`} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt="" /> : initials}
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: 160, zIndex: 999, boxShadow: 'var(--shadow-lg)' }}>
                    <Link to="/profile" className="nav-link" style={{ display: 'block', width: '100%' }} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                    <Link to="/my-listings" className="nav-link" style={{ display: 'block' }} onClick={() => setMenuOpen(false)}>📦 My Listings</Link>
                    <hr className="divider" style={{ margin: '0.3rem 0' }} />
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '0.4rem 0.9rem', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
