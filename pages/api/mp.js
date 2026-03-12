/**
 * API route: /api/mp?postalCode=M5V3L9
 *
 * Proxies the Represent.ca API to avoid CORS issues from the browser and to
 * avoid exposing unnecessary data to the client.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postalCode } = req.query;

  if (!postalCode) {
    return res.status(400).json({ error: 'postalCode query parameter is required' });
  }

  // Normalize: strip spaces, uppercase
  const normalized = postalCode.replace(/\s+/g, '').toUpperCase();

  // Basic Canadian postal code format validation: A1A1A1
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)) {
    return res.status(400).json({
      error: 'Invalid postal code format. Please enter a valid Canadian postal code (e.g. M5V 3L9).',
    });
  }

  const url = `https://represent.opennorth.ca/postcodes/${normalized}/`;

  let data;
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: 'No results found for that postal code. Please check and try again.',
        });
      }
      return res.status(502).json({ error: 'Error communicating with representative lookup service.' });
    }

    data = await response.json();
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
    console.error('Represent.ca fetch error:', err);
    return res.status(502).json({ error: 'Could not reach representative lookup service.' });
  }

  // representatives_centroid contains all reps for the postal code centroid.
  // We want federal MPs only: elected_office === "MP"
  const reps = data.representatives_centroid || [];
  const mp = reps.find(
    (r) =>
      r.elected_office === 'MP' ||
      (r.elected_office || '').toLowerCase() === 'mp'
  );

  if (!mp) {
    return res.status(404).json({
      error:
        'No federal MP found for that postal code. The Represent.ca database may not have data for your area. Try a nearby postal code, or look up your MP at ourcommons.ca.',
    });
  }

  // Return only the fields we need
  return res.status(200).json({
    name: mp.name || '',
    riding: mp.district_name || '',
    party: mp.party_name || '',
    email: mp.email || '',
    url: mp.url || '',
  });
}
