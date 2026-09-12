import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const OUT = 'barz/beat-cache.json';
const MAX_PER_ARTIST = 6;
const SEARCH_COUNT = 12;
const MIN_SEC = 60;
const MAX_SEC = 480;
const YEAR = 2026;
const EXCLUDE = /(^|[^a-z])(mix|mixtape|playlist|tutorial|shorts?|how ?to)([^a-z]|$)/i;

const TYPE_ARTISTS = {
  Bladee: 'Bladee type beat 2026',
  Ecco2k: 'Ecco2k type beat 2026',
  Future: 'Future type beat 2026',
  'Travis Scott': 'Travis Scott type beat 2026',
  'Ken Carson': 'Ken Carson type beat 2026',
  'Playboi Carti': 'Playboi Carti type beat 2026',
  'Destroy Lonely': 'Destroy Lonely type beat 2026',
  Yeat: 'Yeat type beat 2026'
};

function daysSince(ts) {
  return Math.max(1, (Date.now() - ts) / 86400000);
}
function score(t) {
  return (Number(t.views) || 0) / daysSince(t.publishedAt || Date.now());
}
function normalize(entry, artist) {
  const id = String(entry?.id || '').trim();
  const title = String(entry?.title || '').trim();
  const durationSec = Math.round(Number(entry?.duration) || 0);
  const uploadDate = String(entry?.upload_date || '');
  const publishedAt = /^\d{8}$/.test(uploadDate)
    ? Date.parse(`${uploadDate.slice(0,4)}-${uploadDate.slice(4,6)}-${uploadDate.slice(6,8)}T00:00:00Z`)
    : Date.now();
  return {
    videoId: id,
    url: id ? `https://www.youtube.com/watch?v=${id}` : '',
    title: title.slice(0, 140),
    channel: String(entry?.channel || entry?.uploader || '').slice(0, 60),
    views: Number(entry?.view_count) || 0,
    publishedAt,
    durationSec,
    embeddable: true,
    sourceArtist: artist,
    bad: '',
    plays: 0,
    skips: 0,
    lastPlayedAt: 0
  };
}
function keep(t) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(t.videoId)) return false;
  if (!t.title || EXCLUDE.test(t.title)) return false;
  if (t.durationSec < MIN_SEC || t.durationSec > MAX_SEC) return false;
  if (new Date(t.publishedAt).getUTCFullYear() < YEAR - 1) return false;
  return true;
}
function search(query, artist) {
  const target = `ytsearch${SEARCH_COUNT}:${query}`;
  const args = [
    '--dump-single-json',
    '--skip-download',
    '--ignore-errors',
    '--no-warnings',
    '--no-playlist',
    target
  ];
  const r = spawnSync('yt-dlp', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0 && !r.stdout.trim()) throw new Error(r.stderr.trim() || `yt-dlp exited ${r.status}`);
  const data = JSON.parse(r.stdout || '{}');
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const tracks = entries.map(x => normalize(x, artist)).filter(keep);
  tracks.sort((a, b) => score(b) - score(a) || b.views - a.views);
  const seen = new Set();
  return tracks.filter(t => !seen.has(t.videoId) && seen.add(t.videoId)).slice(0, MAX_PER_ARTIST);
}

let base = { version: 2, slots: {} };
try { base = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
if (!base || typeof base !== 'object') base = { version: 2, slots: {} };
if (!base.slots || typeof base.slots !== 'object') base.slots = {};

let total = 0;
for (const [artist, query] of Object.entries(TYPE_ARTISTS)) {
  const slot = `TYPE:${artist}|HOT`;
  try {
    const tracks = search(query, artist);
    base.slots[slot] = tracks;
    total += tracks.length;
    console.log(`${slot}: ${tracks.length}`);
  } catch (e) {
    console.error(`${slot}: ${e.message}`);
    if (!Array.isArray(base.slots[slot])) base.slots[slot] = [];
  }
}

if (!total) throw new Error('No Type Beat candidates were generated');
base.version = 2;
base.generatedAt = new Date().toISOString();
base.year = YEAR;
base.typeArtists = Object.keys(TYPE_ARTISTS);
base.rules = { ...(base.rules || {}), minSec: MIN_SEC, maxSec: MAX_SEC, typeMax: MAX_PER_ARTIST, source: 'yt-dlp' };
fs.writeFileSync(OUT, JSON.stringify(base, null, 2) + '\n');
console.log(`Wrote ${OUT}: ${total} Type Beat candidates`);
