import React, { useState } from 'react';
import { RefreshCw, Monitor, Smartphone } from 'lucide-react';

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
    <div className="tp-voucher-frame">
      <div className="tp-voucher-top-info" style={{ alignItems: 'center', padding: '8px 16px', background: '#e1eff8' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0c3c78' }}>
          Offline Synchronization & Devices
        </div>
        <button 
          className="tp-btn tp-btn-primary" 
          onClick={handleSyncNow} 
          disabled={isSyncing}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Sync Summary Section */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1, background: '#ffffff', border: '1px solid #94bde0', padding: '12px' }}>
            <div style={{ fontSize: 11, color: '#374151', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Sync Status
            </div>
            <div style={{ fontSize: 16, color: '#059669', fontWeight: 'bold', marginBottom: 4 }}>
              Online
            </div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>
              Last synchronized: Today at {lastSyncTime}
            </div>
          </div>
          
          <div style={{ flex: 1, background: '#ffffff', border: '1px solid #94bde0', padding: '12px' }}>
            <div style={{ fontSize: 11, color: '#374151', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Offline Pending Queue
            </div>
            <div style={{ fontSize: 16, color: '#0c3c78', fontWeight: 'bold', marginBottom: 4 }}>
              0 Items
            </div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>
              Sync Strategy: Delta Sync + Idempotency
            </div>
          </div>
        </div>

        {/* Connected Devices Table */}
        <div>
          <div className="tp-gateway-section-title" style={{ display: 'inline-block', marginBottom: '8px', border: 'none', background: 'transparent', padding: 0 }}>
            Connected Devices (Agre Network)
          </div>
          <div className="tp-table-wrap" style={{ margin: 0, borderTop: '2px solid #0c3c78' }}>
            <table className="tp-table">
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
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px' }}>
                    <Monitor size={14} /> Shop Main Counter (This Machine)
                  </td>
                  <td style={{ padding: '6px' }}>Desktop (macOS / Windows)</td>
                  <td style={{ padding: '6px' }}><span style={{ color: '#059669', fontWeight: 'bold' }}>Active</span></td>
                  <td style={{ padding: '6px' }}>Just now</td>
                </tr>
                <tr>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px' }}>
                    <Smartphone size={14} /> Floor Mobile Terminal #1
                  </td>
                  <td style={{ padding: '6px' }}>Mobile (Android / iOS)</td>
                  <td style={{ padding: '6px' }}><span style={{ color: '#059669', fontWeight: 'bold' }}>Active</span></td>
                  <td style={{ padding: '6px' }}>5 mins ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
