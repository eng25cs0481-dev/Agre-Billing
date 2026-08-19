import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Smartphone, Monitor } from 'lucide-react';

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1800);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Offline Synchronization & Devices</h1>
      </div>

      <div className="voucher-form" style={{ padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-accent)' }}>Sync Status: Online</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Last synchronized: Today at {lastSyncTime}
            </p>
          </div>
          <button className="btn btn-accent" onClick={handleSyncNow} disabled={isSyncing}>
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="summary-row" style={{ marginTop: 'var(--space-4)' }}>
          <div className="summary-card">
            <div className="summary-card-label">Offline Pending Queue</div>
            <div className="summary-card-value" style={{ color: 'var(--color-success)' }}>0 Items</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Sync Strategy</div>
            <div className="summary-card-value" style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>Delta Sync + Idempotency</div>
          </div>
        </div>

        <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>
          Connected Devices (Agre Network)
        </h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Monitor size={14} /> Shop Main Counter (This Machine)
              </td>
              <td>Desktop (macOS / Windows)</td>
              <td><span className="badge badge-confirmed">Active</span></td>
              <td>Just now</td>
            </tr>
            <tr>
              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={14} /> Floor Mobile Terminal #1
              </td>
              <td>Mobile (Android / iOS)</td>
              <td><span className="badge badge-confirmed">Active</span></td>
              <td>5 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
