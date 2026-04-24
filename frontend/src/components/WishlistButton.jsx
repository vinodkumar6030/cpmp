import { useState, useEffect } from 'react';

export default function WishlistButton({ productId, style = {} }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('campus_wishlist') || '[]');
    setSaved(list.includes(productId));
  }, [productId]);

  const toggle = (e) => {
    e.stopPropagation();
    const list = JSON.parse(localStorage.getItem('campus_wishlist') || '[]');
    let updated;
    if (list.includes(productId)) {
      updated = list.filter(id => id !== productId);
    } else {
      updated = [...list, productId];
    }
    localStorage.setItem('campus_wishlist', JSON.stringify(updated));
    setSaved(!saved);
  };

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.4rem',
        lineHeight: 1,
        padding: '0.2rem',
        transition: 'transform 0.2s ease',
        ...style
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {saved ? '❤️' : '🤍'}
    </button>
  );
}
