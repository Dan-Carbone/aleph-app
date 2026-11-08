import { Router } from 'express';

const router = Router();

// Base URL for Attack on Titan external REST API
const AOT_API_BASE_URL = 'https://api.attackontitanapi.com';

/**
 * Handler to fetch list of Titans
 */
const getTitans = async (req, res) => {
  try {
    const response = await fetch(`${AOT_API_BASE_URL}/titans`);
    if (!response.ok) {
      throw new Error(`Titans API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // Normalize response: depending on API version, results are in data.results or directly in data
    const titans = Array.isArray(data) ? data : data.results || [];
    return res.json({ results: titans });
  } catch (error) {
    console.error('[Titan API Error] Error fetching Titans:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve Titans data.' });
  }
};

/**
 * Handler to fetch paginated characters with optional search query
 */
const getCharacters = async (req, res) => {
  const page = req.query.page || 1;
  const search = req.query.search || '';

  try {
    let url = `${AOT_API_BASE_URL}/characters?page=${page}`;
    if (search) {
      url += `&name=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Characters API responded with status: ${response.status}`);
    }
    const data = await response.json();

    return res.json({
      info: data.info || {},
      results: data.results || [],
    });
  } catch (error) {
    console.error('[Titan API Error] Error fetching characters:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve characters data.' });
  }
};

// Route definitions (supporting both relative paths and /api prefixes)
router.get('/titans', getTitans);
router.get('/api/titans', getTitans);

router.get('/characters', getCharacters);
router.get('/api/characters', getCharacters);

export default router;