import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, ChevronRight, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/appStore';
import type { Company } from '@agre/shared/types';

export const CompanySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCompany, company: currentCompany } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [yearStart, setYearStart] = useState(new Date().getFullYear() + '-04-01');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (comp: Company) => {
    setCompany(comp);
    navigate('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newComp = await api.createCompany({
        name,
        address,
        city,
        state,
        email,
        phone,
        books_beginning_date: yearStart,
        currency_code: 'INR',
        currency_symbol: '₹',
        decimal_places: 2,
      });

      setCompany(newComp);
      navigate('/');
    } catch (err) {
      console.error('Failed to create company:', err);
      alert('Failed to create company');
    }
  };

  return (
    <div className="tp-gateway-container" style={{ alignItems: 'center' }}>
      <div className="tp-gateway-box" style={{ width: '450px' }}>
        
        {/* Header */}
        <div className="tp-gateway-header" style={{ padding: '12px 0', fontSize: '15px' }}>
          Agre Billing - {showCreate ? 'Create New Company' : 'Select Company'}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px', background: 'var(--tp-bg-work)' }}>
          {showCreate ? (
            <form onSubmit={handleCreate}>
              <div className="tp-gateway-section-title" style={{ marginBottom: '12px', paddingLeft: 0, border: 'none', background: 'transparent' }}>
                Company Details
              </div>

              <div className="tp-voucher-party-row">
                <div className="tp-party-label">Company Name <span style={{color: 'red'}}>*</span></div>
                <div className="tp-colon">:</div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="tp-party-input"
                  placeholder="e.g. Agre Hardware Stores"
                  autoFocus
                />
              </div>

              <div className="tp-voucher-party-row">
                <div className="tp-party-label">Address</div>
                <div className="tp-colon">:</div>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="tp-party-input"
                />
              </div>

              <div className="tp-voucher-party-row">
                <div className="tp-party-label">City / State</div>
                <div className="tp-colon">:</div>
                <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="tp-party-input"
                    placeholder="City"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="tp-party-input"
                    placeholder="State"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="tp-voucher-party-row">
                <div className="tp-party-label">Financial Year <span style={{color: 'red'}}>*</span></div>
                <div className="tp-colon">:</div>
                <input
                  type="date"
                  required
                  value={yearStart}
                  onChange={e => setYearStart(e.target.value)}
                  className="tp-party-input"
                  style={{ width: '130px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #cadfe8', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="tp-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tp-btn primary"
                >
                  Create & Login
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="tp-gateway-section-title" style={{ marginBottom: '8px', paddingLeft: 0, border: 'none', background: 'transparent' }}>
                List of Companies
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>Loading companies...</div>
              ) : companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                  No companies found. Create your first company to begin.
                </div>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #94bde0', background: '#fff' }}>
                  {companies.map(comp => {
                    const isSelected = currentCompany?.id === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => handleSelect(comp)}
                        className={`tp-gateway-menu-item ${isSelected ? 'selected' : ''}`}
                        style={{ padding: '8px 12px', borderBottom: '1px solid #e5ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <div style={{ fontWeight: isSelected ? '700' : '600', fontSize: '12.5px', color: isSelected ? '#000' : '#0c3c78' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: isSelected ? '#333' : '#64748b', marginTop: '2px' }}>
                            {comp.city ? `${comp.city}, ${comp.state}` : 'Address not set'}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ fontSize: '10px', background: '#f59e0b', color: '#000', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>
                            CURRENT
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: '20px', borderTop: '1px solid #cadfe8', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCreate(true)}
                  className="tp-btn primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  Create New Company
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!showCreate && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: '#64748b', fontSize: '11px', width: '450px' }}>
          Like Tally, you can create multiple companies and manage their books completely separately.
        </div>
      )}
    </div>
  );
};
