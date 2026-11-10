// Rewrite a built Astro site so it can be opened straight from disk (file://), no server needed.
//
//   node scripts/make-relative.mjs [distDir]
//
// For every .html and .css file in distDir:
//   - root-relative URLs ("/starter/", "/_astro/x.webp") become relative ("../_astro/x.webp")
//   - links to directories ("starter/", "../", ".") get "index.html" appended,
//     because browsers don't resolve directory index pages for file:// URLs.
// External URLs (http:, https:, mailto:, data:, //host, #anchors) are left alone.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve(process.argv[2] ?? 'dist');
// If the site was built with a BASE_PATH, strip it so "/repo/x" maps to "dist/x".
const base = '/' + (process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');

async function* walk(dir) {
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function isExternal(url) {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) || url === '';
}

/** Rewrite one URL as seen from a file located in `fromDir` (absolute path inside dist). */
function rewrite(url, fromDir) {
  if (isExternal(url)) return url;
  const m = url.match(/^([^?#]*)(.*)$/);
  let [, p, suffix] = m;

  if (p.startsWith('/')) {
    if (base !== '/' && (p === base || p.startsWith(base + '/'))) p = p.slice(base.length) || '/';
    let rel = path.relative(fromDir, path.join(distDir, p)).split(path.sep).join('/');
    if (p.endsWith('/')) rel = rel ? rel + '/' : './';
    p = rel || './';
  }
  if (p === '.' || p === '..') p += '/';
  if (p.endsWith('/')) p += 'index.html';
  return p + suffix;
}

const ATTR_RE = /(\s(?:href|src|poster|action)=)(["'])(.*?)\2/gi;
const SRCSET_RE = /(\ssrcset=)(["'])(.*?)\2/gi;
const CSS_URL_RE = /url\(\s*(["']?)([^"')]+)\1\s*\)/gi;

let changed = 0;
for await (const file of walk(distDir)) {
  const ext = path.extname(file);
  if (ext !== '.html' && ext !== '.css') continue;
  const fromDir = path.dirname(file);
  const src = await readFile(file, 'utf8');
  let out = src.replace(CSS_URL_RE, (_, q, u) => `url(${q}${rewrite(u, fromDir)}${q})`);
  if (ext === '.html') {
    out = out
      .replace(ATTR_RE, (_, a, q, u) => `${a}${q}${rewrite(u, fromDir)}${q}`)
      .replace(SRCSET_RE, (_, a, q, list) => {
        const items = list.split(',').map((item) => {
          const [u, ...desc] = item.trim().split(/\s+/);
          return [rewrite(u, fromDir), ...desc].join(' ');
        });
        return `${a}${q}${items.join(', ')}${q}`;
      });
  }
  if (out !== src) {
    await writeFile(file, out);
    changed++;
  }
}
console.log(`make-relative: rewrote URLs in ${changed} file(s) under ${path.relative(process.cwd(), distDir) || '.'}`);
