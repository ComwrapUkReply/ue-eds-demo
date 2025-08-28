/* eslint-env browser */
import { readBlockConfig, toClassName } from '../../scripts/aem.js';

// Configuration object groups all constants and message strings
const NAV_CONFIG = {
  PATHS: {
    INDEX: '/query-index.json',
  },
  QUERY: {
    LIMIT: 1000,
  },
  SELECTORS: {
    ROOT_LIST: 'ul.navigation-root',
  },
  MESSAGES: {
    LOAD_ERROR: 'Navigation failed to load.',
    EMPTY: 'No navigation items available.',
  },
  EXCLUDED_PATHS: [
    '/footer',
    '/nav',
  ],
};

/**
 * Defensive JSON fetch helper with abort and basic validation.
 * @param {string} url URL to fetch
 * @returns {Promise<object|null>} parsed JSON or null on error
 */
async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fetchJson error:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extracts rows from query index response supporting common shapes.
 * @param {any} payload response body
 * @returns {Array<object>} normalized rows
 */
function normalizeIndexRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

/**
 * Returns the pathname normalized (no trailing slash, except root).
 * @param {string} path input path
 * @returns {string} normalized path
 */
function normalizePath(path) {
  try {
    if (!path) return '/';
    const u = new URL(path, window.location.origin);
    const clean = u.pathname.replace(/\/+$/g, '');
    return clean || '/';
  } catch (_) {
    return '/';
  }
}

/**
 * Get display title from a row with fallbacks.
 * @param {object} row index row
 * @returns {string}
 */
function getRowTitle(row) {
  return (
    row.title
    || row['jcr:title']
    || row['og:title']
    || row.name
    || (row.path ? row.path.split('/').pop() : '')
    || 'Untitled'
  );
}

/**
 * Get description from a row with fallbacks.
 * @param {object} row index row
 * @returns {string}
 */
function getRowDescription(row) {
  return (
    row.description
    || row['jcr:description']
    || row['og:description']
    || ''
  );
}

/**
 * Build a hierarchical map of pages.
 * Only two levels are exposed for navigation (root + children).
 * @param {Array<object>} rows index rows
 * @param {string} rootPath root base path (normalized)
 * @param {number} maxDepth maximum depth to include (default 2)
 * @returns {{roots: Array<object>, childrenByParent: Map<string, Array<object>>}}
 */
function buildHierarchy(rows, rootPath = '/', maxDepth = 2) {
  const roots = [];
  const childrenByParent = new Map();

  const base = normalizePath(rootPath);
  const baseDepth = base === '/' ? 0 : base.split('/').filter(Boolean).length;

  rows.forEach((row) => {
    const path = normalizePath(row.path || row.url || '');
    if (!path.startsWith(base)) return;

    // exclude robots noindex pages if robots field is present
    if (typeof row.robots === 'string' && row.robots.toLowerCase().includes('noindex')) return;

    // exclude footer and header paths from navigation
    if (NAV_CONFIG.EXCLUDED_PATHS.some((excludedPath) => path === excludedPath || path.startsWith(`${excludedPath}/`))) return;

    const segments = path.split('/').filter(Boolean);
    const depth = segments.length;
    if (maxDepth && depth - baseDepth > maxDepth) return;

    // Determine this page's direct parent within base scope
    const parent = depth - baseDepth <= 1
      ? base
      : `/${segments.slice(0, baseDepth + 1).join('/')}`;

    const item = {
      path,
      title: getRowTitle(row),
      description: getRowDescription(row),
    };

    if (parent === base) {
      roots.push(item);
    } else {
      const arr = childrenByParent.get(parent) || [];
      arr.push(item);
      childrenByParent.set(parent, arr);
    }
  });

  // Sort roots and children alphabetically by title for stable UI
  const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  roots.sort(byTitle);
  childrenByParent.forEach((arr, key) => {
    arr.sort(byTitle);
    childrenByParent.set(key, arr);
  });

  return { roots, childrenByParent };
}

/**
 * Build DOM list for navigation with optional second level.
 * @param {HTMLElement} container block root
 * @param {Array<object>} roots root items
 * @param {Map<string, Array<object>>} childrenByParent children grouped by parent path
 * @param {string} base base path used for parent matching
 */
function renderNavigation(container, roots, childrenByParent, base) {
  const navEl = document.createElement('nav');
  navEl.setAttribute('aria-label', 'Site navigation');
  navEl.className = 'navigation';

  const ul = document.createElement('ul');
  ul.className = 'navigation-root';

  roots.forEach((rootItem) => {
    const li = document.createElement('li');
    li.className = 'navigation-item';

    const children = childrenByParent.get(normalizePath(rootItem.path))
      || childrenByParent.get(base)
      || [];

    const a = document.createElement('a');
    a.textContent = rootItem.title;
    a.className = 'navigation-link';

    // If item has children, disable the link and make it clickable for submenu toggle
    if (children.length > 0) {
      a.setAttribute('tabindex', '0');
      a.setAttribute('role', 'button');
      a.setAttribute('aria-expanded', 'false');
      a.setAttribute('aria-label', `Toggle ${rootItem.title} submenu`);
    } else {
      a.href = rootItem.path;
    }

    li.appendChild(a);

    if (children.length > 0) {
      li.classList.add('has-children');
      li.setAttribute('aria-expanded', 'false');

      const childList = document.createElement('ul');
      childList.className = 'navigation-children';

      // Add click event to parent link for submenu toggle
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = li.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;

        li.setAttribute('aria-expanded', newState ? 'true' : 'false');
        a.setAttribute('aria-expanded', newState ? 'true' : 'false');

        // Toggle open class on submenu
        if (newState) {
          childList.classList.add('open');
        } else {
          childList.classList.remove('open');
        }
      });

      // Add keyboard support for Enter and Space keys
      a.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          a.click();
        }
      });
      children.forEach((child) => {
        const cli = document.createElement('li');
        cli.className = 'navigation-child-item';
        const ca = document.createElement('a');
        ca.href = child.path;
        ca.className = 'navigation-child-link';
        ca.textContent = child.title;
        cli.appendChild(ca);
        if (child.description) {
          const desc = document.createElement('p');
          desc.className = 'navigation-description';
          desc.textContent = child.description;
          cli.appendChild(desc);
        }
        childList.appendChild(cli);
      });
      li.appendChild(childList);
    }

    ul.appendChild(li);
  });

  navEl.appendChild(ul);
  container.appendChild(navEl);
}

/**
 * Read optional authoring configuration from block content table.
 * Supported keys: root-path, max-depth
 * @param {HTMLElement} block block element
 * @returns {{ rootPath: string, maxDepth: number }}
 */
function readConfig(block) {
  const cfg = readBlockConfig(block);
  const rootPath = normalizePath(cfg['root-path'] || cfg.root || '/');
  const maxDepthRaw = cfg['max-depth'] || cfg.depth || '2';
  const maxDepth = Number.parseInt(maxDepthRaw, 10);
  return {
    rootPath,
    maxDepth: Number.isNaN(maxDepth) ? 2 : Math.max(1, Math.min(maxDepth, 4)),
  };
}

/**
 * Main decorator: fetch index and render navigation tree.
 * @param {HTMLElement} block block element
 */
export default async function decorate(block) {
  // Clear authoring table content but keep config by reading it first
  const { rootPath, maxDepth } = readConfig(block);
  block.textContent = '';

  const indexUrl = new URL(NAV_CONFIG.PATHS.INDEX, window.location.origin);
  indexUrl.searchParams.set('limit', String(NAV_CONFIG.QUERY.LIMIT));

  const payload = await fetchJson(indexUrl.href);
  if (!payload) {
    const p = document.createElement('p');
    p.className = 'navigation-error';
    p.textContent = NAV_CONFIG.MESSAGES.LOAD_ERROR;
    block.appendChild(p);
    return;
  }

  const rows = normalizeIndexRows(payload)
    .filter((r) => r && (r.path || r.url));

  const { roots, childrenByParent } = buildHierarchy(rows, rootPath, maxDepth);
  if (roots.length === 0) {
    const p = document.createElement('p');
    p.className = 'navigation-empty';
    p.textContent = NAV_CONFIG.MESSAGES.EMPTY;
    block.appendChild(p);
    return;
  }

  renderNavigation(block, roots, childrenByParent, normalizePath(rootPath));

  // Add block-level classes for styling and inheritance
  block.classList.add('navigation-initialized');
  block.classList.add(`navigation-depth-${toClassName(String(maxDepth))}`);
}
