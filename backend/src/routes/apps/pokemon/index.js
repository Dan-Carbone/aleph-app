import { Router } from 'express';

const router = Router();

/**
 * Handler to fetch a paginated list of Pokémon along with their primary details.
 * Supports limit and offset query parameters.
 */
const getPokemonList = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 12;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    // 1. Fetch paginated Pokémon summary list from PokéAPI
    const listResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!listResponse.ok) {
      throw new Error(`PokéAPI responded with status: ${listResponse.status}`);
    }
    const listData = await listResponse.json();

    // 2. Fetch full details for each Pokémon concurrently
    const detailedPokemon = await Promise.all(
      listData.results.map(async (pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        const data = await detailResponse.json();

        // Return only the attributes required by the frontend card view
        return {
          id: data.id,
          name: data.name,
          sprite:
            data.sprites.other?.['official-artwork']?.front_default ||
            data.sprites.front_default,
          types: data.types.map((item) => item.type.name),
          height: data.height / 10, // Convert decimeters to meters
          weight: data.weight / 10, // Convert hectograms to kilograms
          stats: data.stats.map((item) => ({
            name: item.stat.name,
            base: item.base_stat,
          })),
        };
      })
    );

    return res.json({
      count: listData.count,
      results: detailedPokemon,
    });
  } catch (error) {
    console.error('[Pokemon API Error] Error fetching Pokémon details:', error);
    return res.status(500).json({ error: 'Failed to retrieve Pokémon data.' });
  }
};

// Route definitions (supports direct root, relative /pokemon, and legacy /api/pokemon)
router.get('/', getPokemonList);
router.get('/pokemon', getPokemonList);
router.get('/api/pokemon', getPokemonList);

export default router;