/**
 * Meta block - Displays a call-to-action link
 * @param {Element} block The meta block element
 */
export default function decorate(block) {
  // Get all cells from the block
  const cells = Array.from(block.children);

  // Clear the block content
  block.innerHTML = '';

  // Create container for the CTA
  const metaContainer = document.createElement('div');
  metaContainer.className = 'meta-container';

  // Process the block structure
  // Expected structure: first cell has link, second cell has text
  let ctaUrl = '';
  let ctaText = '';

  if (cells.length >= 1) {
    const firstCell = cells[0];
    const linkElement = firstCell.querySelector('a');
    if (linkElement) {
      ctaUrl = linkElement.href;
    }
  }

  if (cells.length >= 2) {
    const secondCell = cells[1];
    ctaText = secondCell.textContent.trim();
  }

  // Create the CTA element if we have URL and text
  if (ctaUrl && ctaText) {
    const ctaElement = document.createElement('a');
    ctaElement.href = ctaUrl;
    ctaElement.textContent = ctaText;
    ctaElement.className = 'meta-cta';

    // Add external link indicator if needed
    if (ctaUrl.startsWith('http') && !ctaUrl.includes(window.location.hostname)) {
      ctaElement.target = '_blank';
      ctaElement.rel = 'noopener noreferrer';
      ctaElement.setAttribute('aria-label', `${ctaText} (opens in new tab)`);
    }

    metaContainer.appendChild(ctaElement);
  }

  // Add the container to the block
  block.appendChild(metaContainer);
}
