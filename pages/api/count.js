/**
 * API route: /api/count
 *
 * GET  — returns { count: number }
 * POST — increments counter, returns { count: number }
 *
 * Requires env vars:
 *   UPSTASH_REDIS_REST_URL   — from Upstash dashboard
 *   UPSTASH_REDIS_REST_TOKEN — from Upstash dashboard
 */

const KEY = 'email_count';
const INITIAL = 3;

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Upstash env vars not configured');
  }

  const res = await fetch(`${url}/${command.join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const json = await res.json();
  return json.result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      // Return current count; initialise to INITIAL if key doesn't exist yet
      const exists = await redis(['EXISTS', KEY]);
      if (!exists) {
        await redis(['SET', KEY, String(INITIAL)]);
        return res.status(200).json({ count: INITIAL });
      }
      const count = await redis(['GET', KEY]);
      return res.status(200).json({ count: parseInt(count, 10) });
    }

    if (req.method === 'POST') {
      // Initialise if missing, then increment
      const exists = await redis(['EXISTS', KEY]);
      if (!exists) await redis(['SET', KEY, String(INITIAL)]);
      const count = await redis(['INCR', KEY]);
      return res.status(200).json({ count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Count API error:', err);
    return res.status(500).json({ error: 'Counter unavailable' });
  }
}
