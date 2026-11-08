import { Router } from 'express';

const router = Router();

/**
 * GET /weather (and /api/weather for backwards compatibility)
 * Fetches current weather and a 5-day forecast for a given city via Open-Meteo API.
 */
const handleWeatherRequest = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required.' });
  }

  try {
    // 1. Geocoding: Retrieve coordinates for the given city name
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found.' });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Weather forecast: Current conditions + 5-day forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    return res.json({
      city: name,
      country,
      current: weatherData.current,
      units: weatherData.current_units,
      daily: weatherData.daily,
      daily_units: weatherData.daily_units,
    });
  } catch (error) {
    console.error('[Open-Meteo API Error]:', error);
    return res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
};

// Route definitions
router.get('/weather', handleWeatherRequest);
router.get('/api/weather', handleWeatherRequest);
router.get('/', handleWeatherRequest);

export default router;