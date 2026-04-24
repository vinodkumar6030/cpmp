export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand-icon" style={{ display: 'inline-flex', width: 32, height: 32, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', borderRadius: 8, alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginRight: '0.5rem' }}>🏪</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>CampusMarket</span>
          <p className="footer-tagline">Buy & sell within your campus — safe, simple, student-only.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Marketplace</h4>
            <a href="/">Browse Products</a>
            <a href="/create-listing">Sell an Item</a>
            <a href="/my-listings">My Listings</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <a href="/profile">Profile</a>
            <a href="/messages">Messages</a>
            <a href="/signup">Sign Up</a>
          </div>
          <div className="footer-col">
            <h4>Info</h4>
            <span className="footer-text">🔒 Student verified only</span>
            <span className="footer-text">💬 In-app messaging</span>
            <span className="footer-text">📍 Campus-based listings</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CampusMarket · Built for students, by students.</p>
        <div className="footer-badge-row">
          <span className="footer-badge">🇮🇳 Made in India</span>
          <span className="footer-badge">🎓 Campus Only</span>
          <span className="footer-badge">⚡ Free Forever</span>
        </div>
      </div>
    </footer>
  );
}
