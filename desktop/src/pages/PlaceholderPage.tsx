import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Generic placeholder page for routes not yet fully implemented.
 * Displays the route name and a back button.
 */
export default function PlaceholderPage({ title }: { title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pageName = title || location.pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' → ');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '16px',
    }}>
      <h2 style={{ color: 'var(--text-accent)', fontSize: 'var(--text-xl)' }}>
        {pageName}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        This section is being built. Full implementation coming soon.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Back to Gateway
      </button>
    </div>
  );
}
