export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  const count = Math.min(parseInt(req.query.n) || 8, 20);

  try {
    const token = await getVqd(query);
    if (!token) return res.status(500).json({ error: 'Failed to get search token' });

    const images = await fetchImages(query, token, count);
    return res.status(200).json({ results: images });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
}

async function getVqd(query) {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
    }
  });
  const html = await resp.text();

  const patterns = [
    /vqd=['"]([^'"]+)['"]/,
    /vqd=([\d][\d-]+)/,
    /vqd\\x3d([^&"\\]+)/,
    /vqd%3D([^&"]+)/,
    /"vqd"\s*:\s*"([^"]+)"/
  ];
  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m && m[1]) return m[1];
  }
  return null;
}

async function fetchImages(query, vqd, count) {
  const url = `https://duckduckgo.com/i.js?l=ru-ru&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=size:Medium,,,,,&p=1`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Referer': 'https://duckduckgo.com/'
    }
  });
  const data = await resp.json();

  if (!data.results || !Array.isArray(data.results)) return [];

  return data.results.slice(0, count).map(r => ({
    image: r.image || '',
    thumbnail: r.thumbnail || '',
    title: r.title || '',
    source: r.source || '',
    width: r.width || 0,
    height: r.height || 0
  }));
}
