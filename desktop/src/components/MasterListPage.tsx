import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface MasterListPageProps<T extends { id: string }> {
  title: string;
  columns: Column<T>[];
  data: T[];
  searchFields?: (keyof T)[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSelect?: (item: T) => void;
  loading?: boolean;
  addLabel?: string;
}

export default function MasterListPage<T extends { id: string }>({
  title,
  columns,
  data,
  searchFields = [],
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  loading = false,
  addLabel = 'Create',
}: MasterListPageProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(query);
      })
    );
  }, [data, search, searchFields]);

  useEffect(() => {
    if (selectedIndex >= filteredData.length) {
      setSelectedIndex(Math.max(0, filteredData.length - 1));
    }
  }, [filteredData.length, selectedIndex]);

  const handleDeleteSelected = () => {
    const item = filteredData[selectedIndex];
    if (item && onDelete) {
      onDelete(item);
    }
  };

  useKeyboardShortcuts([
    { key: 'c', ctrl: true, action: () => onAdd?.(), description: 'Create' },
    { key: 'n', ctrl: true, action: () => onAdd?.(), description: 'New' },
    { key: 'd', ctrl: true, action: handleDeleteSelected, description: 'Delete' },
    { key: 'd', alt: true, action: handleDeleteSelected, description: 'Alt+D Delete' },
    { key: 'Delete', action: handleDeleteSelected, description: 'Delete' },
    { key: 'ArrowDown', action: () => setSelectedIndex((i) => Math.min(i + 1, filteredData.length - 1)), description: 'Down' },
    { key: 'ArrowUp', action: () => setSelectedIndex((i) => Math.max(i - 1, 0)), description: 'Up' },
    {
      key: 'Enter',
      action: () => {
        const item = filteredData[selectedIndex];
        if (item) onSelect?.(item) ?? onEdit?.(item);
      },
      description: 'Select / Alter',
    },
    { key: 'Escape', action: () => navigate('/'), description: 'Quit' },
  ]);

  if (loading) {
    return <div style={{ padding: 20, color: '#0c3c78', fontWeight: 'bold' }}>Loading {title}...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Filter & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#0c3c78' }}>{title}</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>({filteredData.length} records)</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            className="tp-search-input"
            style={{ width: 220, background: '#ffffff', border: '1px solid #94bde0' }}
            placeholder={`Filter ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {onAdd && (
            <button className="tp-btn primary" onClick={onAdd}>
              + {addLabel} (^C)
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th style={{ width: '35px' }}>#</th>
              {columns.map((col) => (
                <th key={col.key} className={col.className} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              {onDelete && <th style={{ width: '70px', textAlign: 'center' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onDelete ? 2 : 1)} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No records found. Click "+ {addLabel}" or press Ctrl+C to add.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <tr
                    key={item.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => {
                      setSelectedIndex(index);
                      onSelect?.(item);
                    }}
                    onDoubleClick={() => onEdit?.(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>{index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                      </td>
                    ))}
                    {onDelete && (
                      <td style={{ textAlign: 'center', padding: '2px 4px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="tp-btn"
                          style={{ color: '#b91c1c', borderColor: '#fca5a5', padding: '1px 6px', fontSize: '10px' }}
                          onClick={() => onDelete(item)}
                          title="Delete (Alt+D)"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Guide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: '#4b5563' }}>
        <span>Press <strong>Enter</strong> to Edit | <strong>Alt+D</strong> / <strong>Delete</strong> to Remove | Arrow Keys <strong>↑ ↓</strong> to navigate</span>
        <span>Esc to Quit</span>
      </div>
    </div>
  );
}
