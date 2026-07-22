#!/usr/bin/env node
// Régénère content/manifest.json depuis content/**/*.md.
// Aucune dépendance : le front-matter YAML est parsé à la main (sous-ensemble
// suffisant : scalaires, listes inline [a, b] et listes à tirets).
// Usage : node scripts/build-manifest.mjs
// - content/index.md est la page d'accueil (clé "home", hors arborescence).
// - Les fichiers et dossiers préfixés par "_" ou "." sont ignorés (brouillons).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_DIR = join(ROOT, 'content');
const OUT = join(CONTENT_DIR, 'manifest.json');

function parseScalar(raw) {
  const s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseValue(raw) {
  const s = raw.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    return inner ? inner.split(',').map(parseScalar) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return parseScalar(s);
}

function parseYaml(src) {
  const meta = {};
  let currentKey = null;
  for (const line of src.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(parseScalar(listItem[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      meta[currentKey] = kv[2] === '' ? [] : parseValue(kv[2]);
    }
  }
  return meta;
}

function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!m) return { meta: {}, body: src };
  return { meta: parseYaml(m[1]), body: src.slice(m[0].length) };
}

function prettify(name) {
  const s = name.replace(/[-_]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toTags(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value) return String(value).split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function articleNode(filePath, slug, fileName) {
  const src = readFileSync(filePath, 'utf8');
  const { meta, body } = parseFrontMatter(src);
  const h1 = body.match(/^#\s+(.+)$/m);
  const node = {
    type: 'article',
    slug,
    title: meta.title ? String(meta.title) : h1 ? h1[1].trim() : prettify(fileName.slice(0, -3)),
  };
  if (meta.date) node.date = String(meta.date);
  const tags = toTags(meta.tags);
  if (tags.length) node.tags = tags;
  if (typeof meta.order === 'number') node.order = meta.order;
  if (meta.summary) node.summary = String(meta.summary);
  return node;
}

function walk(dir, relPath) {
  const folders = [];
  const articles = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    if (!relPath && entry.name === 'index.md') continue;
    if (!relPath && entry.name === 'manifest.json') continue;
    const childRel = relPath ? `${relPath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const children = walk(join(dir, entry.name), childRel);
      if (children.length) {
        folders.push({
          type: 'folder',
          name: entry.name,
          path: childRel,
          title: prettify(entry.name),
          children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      articles.push(articleNode(join(dir, entry.name), childRel.slice(0, -3), entry.name));
    }
  }
  folders.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  articles.sort((a, b) => {
    const oa = a.order ?? Infinity;
    const ob = b.order ?? Infinity;
    if (oa !== ob) return oa - ob;
    if ((a.date || '') !== (b.date || '')) return (b.date || '').localeCompare(a.date || '');
    return a.title.localeCompare(b.title, 'fr');
  });
  return [...folders, ...articles];
}

function countArticles(nodes) {
  return nodes.reduce((n, node) => n + (node.type === 'folder' ? countArticles(node.children) : 1), 0);
}

const homePath = join(CONTENT_DIR, 'index.md');
const home = existsSync(homePath) ? articleNode(homePath, 'index', 'index.md') : null;
const tree = existsSync(CONTENT_DIR) ? walk(CONTENT_DIR, '') : [];
writeFileSync(OUT, JSON.stringify({ home, tree }, null, 2) + '\n');
console.log(`content/manifest.json régénéré — ${countArticles(tree) + (home ? 1 : 0)} page(s)`);
