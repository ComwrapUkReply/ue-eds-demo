import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const HERO_CONFIG = {
  IMAGE_WIDTHS: ['1200', '750'],
};

function buildMedia(container, imgEl) {
  if (!imgEl) return;
  const { src, alt } = imgEl;
  const picture = createOptimizedPicture(
    src,
    alt || 'Hero image',
    false,
    HERO_CONFIG.IMAGE_WIDTHS.map((width) => ({ width }))
  );
  moveInstrumentation(imgEl, picture.querySelector('img'));
  container.appendChild(picture);
}

function buildContent(container, titleEl, textEl, linkHref, linkText, linkTitle) {
  if (titleEl) {
    const h1 = document.createElement('h1');
    h1.textContent = titleEl.textContent?.trim() || '';
    container.appendChild(h1);
  }

  if (textEl) {
    const p = document.createElement('h4');
    p.innerHTML = textEl.innerHTML;
    container.appendChild(p);
  }

  if (linkHref && linkText) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText;
    if (linkTitle) a.title = linkTitle;
    a.classList.add('button', 'primary');
    p.appendChild(a);
    container.appendChild(p);
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Read authored values
  const imageCell = rows[0]?.children?.[0] || null;
  const titleCell = rows[0]?.children?.[1] || rows[1]?.children?.[0] || null;
  const textCell = rows[0]?.children?.[2] || rows[1]?.children?.[1] || rows[2]?.children?.[0] || null;
  const buttonCell = rows[0]?.children?.[3] || rows[1]?.children?.[2] || rows[2]?.children?.[1] || rows[3]?.children?.[0] || null;

  const imgEl = imageCell?.querySelector('img');
  const titleEl = titleCell?.querySelector('h1, h2, h3, h4, h5, h6') || titleCell?.firstElementChild;
  const textEl = textCell?.querySelector('p, div');

  // Button link/label: support either explicit modeled fields or a link within the cell
  let linkHref = '';
  let linkText = '';
  let linkTitle = '';
  const authoredLink = buttonCell?.querySelector('a');
  if (authoredLink) {
    linkHref = authoredLink.href;
    linkText = authoredLink.textContent?.trim() || '';
    linkTitle = authoredLink.title || '';
  }

  // Rebuild block DOM
  block.textContent = '';

  // Media
  const mediaWrapper = document.createElement('div');
  buildMedia(mediaWrapper, imgEl);

  // Content
  const contentWrapper = document.createElement('div');
  buildContent(contentWrapper, titleEl, textEl, linkHref, linkText, linkTitle);

  // Append
  block.append(mediaWrapper, contentWrapper);

  if (rows[0]) moveInstrumentation(rows[0], block);
}


