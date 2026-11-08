import { useState } from 'react';
import WeatherChart from './WeatherChart';

/**
 * Maps WMO weather codes to human-readable English descriptions and emojis.
 */
function getWeatherDesc(code) {
  const codes = {
    0: 'Clear sky ☀️',
    1: 'Mainly clear 🌤️',
    2: 'Partly cloudy ⛅',
    3: 'Overcast ☁️',
    45: 'Fog 🌫️',
    51: 'Light drizzle 🌦️',
    61: 'Slight rain 🌧️',
    63: 'Moderate rain 🌧️',
    65: 'Heavy rain 🌧️',
    71: 'Slight snowfall ❄️',
    95: 'Thunderstorm ⛈️',
  };
  return codes[code] || 'Variable 🌤️';
}

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Target the proxied Aleph modular API path with Bearer authentication
      const endpoint = `/api/apps/open-meteo/weather?city=${encodeURIComponent(city.trim())}`;
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve weather data.');
      }

      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', color: '#38bdf8' }}>
          Weather & Forecast 🌍
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Check real-time conditions and a 5-day meteorological forecast.
        </p>
      </header>

      {/* City search form with explicit text and background colors */}
      <form onSubmit={fetchWeather} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="e.g. London, New York, Tokyo..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #475569',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error notification banner */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Weather details view */}
      {weather && (
        <div>
          {/* Current weather card */}
          <div style={{ border: '1px solid #334155', borderRadius: '14px', padding: '24px', textAlign: 'center', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem' }}>
              {weather.city}, {weather.country}
            </h2>
            <div style={{ fontSize: '1.2rem', margin: '8px 0', color: '#cbd5e1' }}>
              {getWeatherDesc(weather.current.weather_code)}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#38bdf8', margin: '12px 0' }}>
              {Math.round(weather.current.temperature_2m)}{weather.units.temperature_2m}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#94a3b8', fontSize: '0.95rem' }}>
              <span>Feels like: <strong>{Math.round(weather.current.apparent_temperature)}{weather.units.apparent_temperature}</strong></span>
              <span>Humidity: <strong>{weather.current.relative_humidity_2m}%</strong></span>
              <span>Wind: <strong>{weather.current.wind_speed_10m} {weather.units.wind_speed_10m}</strong></span>
            </div>
          </div>

          {/* 5-day daily forecast cards */}
          <h3 style={{ marginTop: '32px', marginBottom: '14px', color: '#f8fafc', fontSize: '1.25rem' }}>
            5-Day Forecast
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
            {weather.daily.time.map((date, idx) => (
              <div
                key={date}
                style={{
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </strong>
                <div style={{ fontSize: '1.5rem', margin: '8px 0' }}>
                  {getWeatherDesc(weather.daily.weather_code[idx]).split(' ').pop()}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f87171' }}>
                  {Math.round(weather.daily.temperature_2m_max[idx])}°
                </div>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                  {Math.round(weather.daily.temperature_2m_min[idx])}°
                </div>
              </div>
            ))}
          </div>

          {/* Forecast chart visualization */}
          <div style={{ marginTop: '24px', backgroundColor: '#1e293b', borderRadius: '14px', padding: '16px', border: '1px solid #334155' }}>
            <WeatherChart daily={weather.daily} units={weather.daily_units} />
          </div>
        </div>
      )}
    </div>
  );
}