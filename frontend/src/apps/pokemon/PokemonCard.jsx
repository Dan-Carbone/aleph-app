import React from 'react';

// Type-to-color mapping for badges and accents
const TYPE_COLORS = {
  grass: '#78c850',
  fire: '#f08030',
  water: '#6890f0',
  bug: '#a8b820',
  normal: '#a8a878',
  poison: '#a040a0',
  electric: '#f8d030',
  ground: '#e0c068',
  fairy: '#ee99ac',
  fighting: '#c03028',
  psychic: '#f85888',
  rock: '#b8a038',
  ghost: '#705598',
  ice: '#98d8d8',
  dragon: '#7038f8'
};

export default function PokemonCard({ pokemon, isSelected, onSelect }) {
  // Pick primary type to set card accent tint
  const primaryType = pokemon.types[0] || 'normal';
  const badgeColor = TYPE_COLORS[primaryType] || '#777';

  return (
    <div
      onClick={() => onSelect(pokemon)}
      style={{
        border: isSelected ? '2px solid #0070f3' : '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 8px 16px rgba(0, 112, 243, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Pokemon index badge */}
      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>
        #{String(pokemon.id).padStart(3, '0')}
      </span>

      {/* Official artwork */}
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        style={{ width: '110px', height: '110px', objectFit: 'contain', margin: '8px auto' }}
        loading="lazy"
      />

      {/* Pokemon identifier */}
      <h3 style={{ textTransform: 'capitalize', margin: '6px 0', fontSize: '1.1rem' }}>
        {pokemon.name}
      </h3>

      {/* List of elemental badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {pokemon.types.map((type) => (
          <span
            key={type}
            style={{
              backgroundColor: TYPE_COLORS[type] || badgeColor,
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}