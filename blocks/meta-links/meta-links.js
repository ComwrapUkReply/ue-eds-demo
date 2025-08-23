/**
 * Meta Links block - Displays multiple links with text and titles
 * @param {Element} block The meta-links block element
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
  linksList.className = 'meta-links-list';

  // Process each row to extract links
  rows.forEach((row) => {
    const cells = Array.from(row.children);

    if (cells.length >= 3) {
      const linkCell = cells[0];
      const textCell = cells[1];
      const titleCell = cells[2];

      // Extract link URL from first cell
      const linkElement = linkCell.querySelector('a');
      const linkUrl = linkElement ? linkElement.href : linkCell.textContent.trim();

      // Extract link text from second cell
      const linkText = textCell.textContent.trim();

      // Extract link title from third cell
      const linkTitle = titleCell.textContent.trim();

      // Create link if URL and text exist
      if (linkUrl && linkText) {
        const listItem = document.createElement('li');
        listItem.className = 'meta-links-item';

        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'meta-links-link';

        // Add title attribute if provided
        if (linkTitle) {
          link.title = linkTitle;
          link.setAttribute('aria-label', `${linkText}: ${linkTitle}`);
        }

        // Add external link indicator if needed
        if (linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname)) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          if (!linkTitle) {
            link.setAttribute('aria-label', `${linkText} (opens in new tab)`);
          } else {
            link.setAttribute('aria-label', `${linkText}: ${linkTitle} (opens in new tab)`);
          }
        }

        listItem.appendChild(link);

        // Add title as subtitle if provided
        if (linkTitle) {
          const subtitle = document.createElement('span');
          subtitle.className = 'meta-links-title';
          subtitle.textContent = linkTitle;
          listItem.appendChild(subtitle);
        }

        linksList.appendChild(listItem);
      }
    } else if (cells.length >= 2) {
      // Fallback for 2-column format (link, text)
      const linkCell = cells[0];
      const textCell = cells[1];

      const linkElement = linkCell.querySelector('a');
      const linkUrl = linkElement ? linkElement.href : linkCell.textContent.trim();
      const linkText = textCell.textContent.trim();

      if (linkUrl && linkText) {
        const listItem = document.createElement('li');
        listItem.className = 'meta-links-item';

        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'meta-links-link';

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

  // Add semantic structure
  if (linksList.children.length > 0) {
    linksList.setAttribute('role', 'list');
    Array.from(linksList.children).forEach((item) => {
      item.setAttribute('role', 'listitem');
    });
  }
}
