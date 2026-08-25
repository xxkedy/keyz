import fs from 'node:fs';

const key = String(process.env.YOUTUBE_API_KEY || '').trim();
if (!key) {
  console.log('YOUTUBE_API_KEY is not set; cache generation skipped');
  process.exit(0);
}

const OUT = 'barz/beat-cache.json';
const YEAR = 2026;
const MAX = 20;
const MIN_SEC = 120;
const MAX_SEC = 480;
const FRESH_DAYS = 30;
const EXCLUDE = /(^|[^a-z])(mix|mixtape|playlist|tutorial|shorts?|how ?to)([^a-z]|$)/i;
const GENRES = {
  TRAP: 'trap type beat 2026',
  CLOUD: 'cloud rap type beat 2026',
  PLUG: 'plug type beat 2026',
  RAGE: 'rage type beat 2026',
  POP: 'pop type beat 2026',
  DIGI: 'digicore type beat 2026',
  'CLOUD DRILL': 'cloud drill type beat 2026',
  'CLOUD JERSEY': 'cloud jersey club type beat 2026'
};
const MODES = ['HOT', 'TOP', 'FRESH'];

function isoSeconds(s) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(String(s || ''));
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
}
function daysSince(ts) {
  return Math.max(1, (Date.now() - ts) / 86400000);
}
function score(t, mode) {
  if (mode === 'TOP') return t.views;
  if (mode === 'FRESH') return t.publishedAt;
  return t.views / daysSince(t.publishedAt);
}
function keep(t, mode) {
  if (!t.embeddable) return false;
  if (t.durationSec < MIN_SEC || t.durationSec > MAX_SEC) return false;
  if (EXCLUDE.test(t.title)) return false;
  if (mode === 'FRESH') {
    if (daysSince(t.publishedAt) > FRESH_DAYS || t.views < 300) return false;
  } else if (new Date(t.publishedAt).getUTCFullYear() !== YEAR) return false;
  if (mode === 'HOT' && t.views < 50) return false;
  return true;
}
async function yt(path, params) {
  params.set('key', key);
  const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${params.toString()}`);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j?.error?.message || `YouTube API ${r.status}`);
  return j;
}
async function slot(genre, mode) {
  const now = Date.now();
  const publishedAfter = mode === 'FRESH'
    ? new Date(now - FRESH_DAYS * 86400000).toISOString()
    : `${YEAR}-01-01T00:00:00Z`;
  const search = await yt('search', new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '25',
    q: GENRES[genre],
    order: mode === 'FRESH' ? 'date' : 'viewCount',
    publishedAfter,
    videoEmbeddable: 'true'
  }));
  const ids = (search.items || []).map(x => x.id?.videoId).filter(Boolean);
  if (!ids.length) return [];
  const videos = await yt('videos', new URLSearchParams({
    part: 'snippet,contentDetails,statistics,status',
    id: ids.join(',')
  }));
  const tracks = (videos.items || []).map(x => ({
    videoId: x.id,
    url: `https://www.youtube.com/watch?v=${x.id}`,
    title: String(x.snippet?.title || '').slice(0, 140),
    channel: String(x.snippet?.channelTitle || '').slice(0, 60),
    views: Number(x.statistics?.viewCount) || 0,
    publishedAt: Date.parse(x.snippet?.publishedAt) || 0,
    durationSec: isoSeconds(x.contentDetails?.duration),
    embeddable: x.status?.embeddable !== false,
    bad: '',
    plays: 0,
    skips: 0,
    lastPlayedAt: 0
  })).filter(t => keep(t, mode));
  tracks.sort((a, b) => score(b, mode) - score(a, mode) || b.views - a.views);
  return tracks.slice(0, MAX);
}

const slots = {};
let total = 0;
for (const genre of Object.keys(GENRES)) {
  for (const mode of MODES) {
    const name = `${genre}|${mode}`;
    try {
      const tracks = await slot(genre, mode);
      slots[name] = tracks;
      total += tracks.length;
      console.log(`${name}: ${tracks.length}`);
    } catch (e) {
      console.error(`${name}: ${e.message}`);
      slots[name] = [];
    }
  }
}
if (!total) throw new Error('No Barz beat candidates were generated');

const data = {
  version: 1,
  generatedAt: new Date().toISOString(),
  year: YEAR,
  rules: { minSec: MIN_SEC, maxSec: MAX_SEC, freshDays: FRESH_DAYS, max: MAX },
  slots
};
fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`Wrote ${OUT}: ${total} candidates`);
