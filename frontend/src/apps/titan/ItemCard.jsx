import React from 'react';

// Reusable card for both Titans and Characters
export default function ItemCard({ item, type, isSelected, onSelect }) {
  // Extract thumbnail image or provide fallback banner
  const imageSource = item.img || 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <div
      onClick={() => onSelect(item)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        overflow: 'hidden',
        border: isSelected ? '2px solid #b91c1c' : '1px solid #e2e8f0',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 10px 20px rgba(185, 28, 28, 0.25)'
          : '0 2px 6px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Entity picture */}
      <div style={{ height: '220px', width: '100%', overflow: 'hidden', backgroundColor: '#1e293b' }}>
        <img
          src={imageSource}
          alt={item.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Card summary info */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' }}>
          {item.name}
        </h3>

        {/* Dynamic metadata tag based on resource type */}
        {type === 'titans' ? (
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <strong>Height:</strong> {item.height || 'Unknown'}
          </span>
        ) : (
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <strong>Status:</strong> {item.status || 'Unknown'}
          </span>
        )}

        <button
          style={{
            marginTop: 'auto',
            paddingTop: '8px',
            border: 'none',
            background: 'transparent',
            color: '#b91c1c',
            fontWeight: '600',
            textAlign: 'left',
            cursor: 'pointer',
            paddingLeft: 0
          }}
        >
          View dossier →
        </button>
      </div>
    </div>
  );
}