/**
 * Meta Links block - Displays a single link with text and title
 * @param {Element} block The meta-links block element
 */
export default function decorate(block) {
  // Get all cells from the block
  const cells = Array.from(block.children);

  // Clear the block content
  block.innerHTML = '';

  // Create container for the link
  const linkContainer = document.createElement('div');
  linkContainer.className = 'meta-links-container';

  // According to Adobe docs, the block structure should be:
  // First div: Link URL (as <a> element)
  // Second div: Link Text (as text content)
  // Third div: Link Title/Description (as text content)

  let linkUrl = '';
  let linkText = '';
  let linkTitle = '';

  // Extract data from the generated HTML structure
  if (cells.length >= 1) {
    const firstCell = cells[0];
    const linkElement = firstCell.querySelector('a');
    if (linkElement) {
      linkUrl = linkElement.href;
    }
  }

  if (cells.length >= 2) {
    const secondCell = cells[1];
    linkText = secondCell.textContent.trim();
  }

  if (cells.length >= 3) {
    const thirdCell = cells[2];
    linkTitle = thirdCell.textContent.trim();
  }

  // Create the link element if we have URL and text
  if (linkUrl && linkText) {
    const linkElement = document.createElement('a');
    linkElement.href = linkUrl;
    linkElement.textContent = linkText;
    linkElement.className = 'meta-links-link';

    // Add title attribute if provided
    if (linkTitle) {
      linkElement.title = linkTitle;
      linkElement.setAttribute('aria-label', `${linkText}: ${linkTitle}`);
    }

    // Add external link indicator if needed
    if (linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname)) {
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';
      if (!linkTitle) {
        linkElement.setAttribute('aria-label', `${linkText} (opens in new tab)`);
      } else {
        linkElement.setAttribute('aria-label', `${linkText}: ${linkTitle} (opens in new tab)`);
      }
    }

    linkContainer.appendChild(linkElement);

    // Add title as subtitle if provided
    if (linkTitle) {
      const titleElement = document.createElement('p');
      titleElement.className = 'meta-links-description';
      titleElement.textContent = linkTitle;
      linkContainer.appendChild(titleElement);
    }
  }

  // Add the container to the block
  block.appendChild(linkContainer);

  // Add ARIA labels for accessibility
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', 'Meta navigation link');
}
