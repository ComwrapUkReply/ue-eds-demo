/**
 * Meta block - Displays multiple links
 * @param {Element} block The meta block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = Array.from(block.children);

  // Clear the block content
  block.innerHTML = '';

  // Create container for links
  const linksContainer = document.createElement('div');
  linksContainer.className = 'meta-links-container';

  // Create links list
  const linksList = document.createElement('ul');
  linksList.className = 'meta-links';

  // Process each row to extract links
  rows.forEach((row) => {
    const cells = Array.from(row.children);

    if (cells.length >= 2) {
      const firstCell = cells[0];
      const secondCell = cells[1];

      // Extract link URL from first cell
      const linkElement = firstCell.querySelector('a');
      const linkUrl = linkElement ? linkElement.href : firstCell.textContent.trim();

      // Extract link text from second cell
      const linkText = secondCell.textContent.trim();

      // Create link if both URL and text exist
      if (linkUrl && linkText) {
        const listItem = document.createElement('li');
        listItem.className = 'meta-link-item';

        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'meta-link';

        // Add external link indicator if needed
        if (linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `${linkText} (opens in new tab)`);
        }

        listItem.appendChild(link);
        linksList.appendChild(listItem);
      }
    }
  });

  // Add the links list to the container
  linksContainer.appendChild(linksList);

  // Add the container to the block
  block.appendChild(linksContainer);

  // Add ARIA labels for accessibility
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', 'Meta navigation links');
}
