import { useState, useEffect } from 'react';
import ItemCard from './ItemCard';

export default function App() {
  // Navigation active tab: 'titans' or 'characters'
  const [activeTab, setActiveTab] = useState('titans');

  // Data states
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data whenever activeTab or page changes
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      setSelectedItem(null);

      try {
        const token = localStorage.getItem('token');
        // Point to the Aleph modular API path
        const endpoint =
          activeTab === 'titans'
            ? '/api/apps/titan/titans'
            : `/api/apps/titan/characters?page=${page}`;

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error('Failed to retrieve Attack on Titan records');

        const data = await res.json();
        setItems(data.results || []);
        setPaginationInfo(data.info || {});
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Cancel in-flight requests on dependency transition
    return () => controller.abort();
  }, [activeTab, page]);

  // Client-side text filter
  const displayedItems = items.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header section */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#ef4444', margin: '0 0 10px 0', letterSpacing: '1px' }}>
          ATTACK ON TITAN ARCHIVE
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Explore all the Nine Titans and Survey Corps characters from the database.
        </p>

        {/* Tab switchers */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setActiveTab('titans');
              setPage(1);
              setSearch('');
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'titans' ? '#991b1b' : '#334155',
              color: '#ffffff'
            }}
          >
            The Titans
          </button>
          <button
            onClick={() => {
              setActiveTab('characters');
              setPage(1);
              setSearch('');
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'characters' ? '#991b1b' : '#334155',
              color: '#ffffff'
            }}
          >
            Characters
          </button>
        </div>

        {/* Search filter input with explicit color & background */}
        <div style={{ marginTop: '16px' }}>
          <input
            type="text"
            placeholder={`Filter ${activeTab} by name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 16px',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
        </div>
      </header>

      {/* Loading & error indicators */}
      {loading && <p style={{ textAlign: 'center', color: '#94a3b8' }}>Consulting scout records...</p>}
      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {displayedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            type={activeTab}
            isSelected={selectedItem?.id === item.id}
            onSelect={setSelectedItem}
          />
        ))}
      </div>

      {/* Pagination for characters */}
      {activeTab === 'characters' && paginationInfo.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '30px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#ffffff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Page {page} of {paginationInfo.pages}
          </span>
          <button
            disabled={!paginationInfo.next_page}
            onClick={() => setPage((prev) => prev + 1)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#ffffff', cursor: !paginationInfo.next_page ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Detail inspect modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#7f1d1d' }}>{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#334155' }}
              >
                ✕
              </button>
            </div>

            {selectedItem.img && (
              <img
                src={selectedItem.img}
                alt={selectedItem.name}
                style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
              />
            )}

            {activeTab === 'titans' ? (
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155' }}>
                <p><strong>Height:</strong> {selectedItem.height || 'N/A'}</p>
                <p><strong>Current Inheritor:</strong> {selectedItem.current_inheritor || 'Unknown'}</p>
                <p><strong>Allegiance:</strong> {selectedItem.allegiance || 'None'}</p>
                {selectedItem.abilities && selectedItem.abilities.length > 0 && (
                  <div>
                    <strong>Abilities:</strong>
                    <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                      {selectedItem.abilities.map((ability, idx) => (
                        <li key={idx}>{ability}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155' }}>
                <p><strong>Species:</strong> {selectedItem.species || 'Unknown'}</p>
                <p><strong>Gender:</strong> {selectedItem.gender || 'Unknown'}</p>
                <p><strong>Age:</strong> {selectedItem.age || 'Unknown'}</p>
                <p><strong>Status:</strong> {selectedItem.status || 'Unknown'}</p>
                <p><strong>Occupation:</strong> {selectedItem.occupation || 'N/A'}</p>
                <p><strong>Birthplace:</strong> {selectedItem.birthplace || 'Unknown'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}