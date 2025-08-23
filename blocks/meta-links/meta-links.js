import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Meta Links block - Displays multiple links with text
 * @param {Element} block The meta-links block element
 */
export default function decorate(block) {
  // Create container for all links
  const linksContainer = document.createElement('div');
  linksContainer.className = 'meta-links-container';

  // Create links list
  const linksList = document.createElement('ul');
  linksList.className = 'meta-links-list';

  // Process each row as a separate link item
  [...block.children].forEach((row) => {
    const listItem = document.createElement('li');
    listItem.className = 'meta-links-item';
    
    // Move instrumentation for Universal Editor
    moveInstrumentation(row, listItem);

    const cells = Array.from(row.children);
    let linkUrl = '';
    let linkText = '';

    // Extract data from the row cells
    // The Universal Editor generates everything in a single cell with this structure:
    // <div><p class="button-container"><a href="#" class="button">Link Text</a></p></div>
    
    if (cells.length >= 1) {
      const firstCell = cells[0];
      const linkElement = firstCell.querySelector('a');
      
      if (linkElement) {
        // Extract URL from href attribute
        linkUrl = linkElement.href;
        
        // Extract text from link content
        linkText = linkElement.textContent.trim();
      }
    }

    // Create the link element if we have URL and text
    if (linkUrl && linkText) {
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'meta-links-link-wrapper';

      const linkElement = document.createElement('a');
      linkElement.href = linkUrl;
      linkElement.textContent = linkText;
      linkElement.className = 'meta-links-link';

      // Add external link indicator if needed
      if (linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname)) {
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.setAttribute('aria-label', `${linkText} (opens in new tab)`);
      }

      linkWrapper.appendChild(linkElement);
      listItem.appendChild(linkWrapper);
    }

    linksList.appendChild(listItem);
  });

  // Add the links list to the container
  linksContainer.appendChild(linksList);

  // Clear the block and add the container
  block.textContent = '';
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
