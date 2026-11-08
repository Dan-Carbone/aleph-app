import { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPokemon() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Target modular Aleph Pokémon API path with JWT token
        const response = await fetch('/api/apps/pokemon?limit=24', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('Server returned an invalid status code.');
        }
        const data = await response.json();
        setPokemonList(data.results || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();

    return () => controller.abort();
  }, []);

  const filteredPokemon = pokemonList.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#f59e0b' }}>Pokédex Explorer</h1>
        <p style={{ color: '#94a3b8' }}>Select a card to inspect stats and technical data.</p>

        {/* Real-time search input with explicit color & background */}
        <input
          type="text"
          placeholder="Filter Pokémon by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            width: '100%',
            maxWidth: '360px',
            borderRadius: '8px',
            border: '1px solid #475569',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            outline: 'none',
            fontSize: '0.95rem'
          }}
        />
      </header>

      {/* Network loading feedback */}
      {loading && <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading Pokémon data...</p>}

      {/* Error notification banner */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Split layout: grid list on the left, focused preview on the right */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPokemon ? '2fr 1fr' : '1fr', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {filteredPokemon.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isSelected={selectedPokemon?.id === pokemon.id}
              onSelect={setSelectedPokemon}
            />
          ))}
        </div>

        {/* Selected item inspection panel */}
        {selectedPokemon && (
          <aside
            style={{
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              height: 'fit-content'
            }}
          >
            <h2 style={{ textTransform: 'capitalize', marginTop: 0, color: '#f59e0b' }}>
              {selectedPokemon.name}
            </h2>
            <img
              src={selectedPokemon.sprite}
              alt={selectedPokemon.name}
              style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
            />
            <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <p><strong>Height:</strong> {selectedPokemon.height} m</p>
              <p><strong>Weight:</strong> {selectedPokemon.weight} kg</p>
            </div>

            <h4 style={{ marginBottom: '8px', marginTop: '16px', color: '#e2e8f0' }}>Base Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedPokemon.stats.map((stat) => (
                <div key={stat.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ textTransform: 'capitalize', color: '#94a3b8' }}>{stat.name}:</span>
                  <strong>{stat.base}</strong>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPokemon(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close Detail
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}