import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Meta Links block - Displays multiple links with text and titles
 * @param {Element} block The meta-links block element
 */
export default function decorate(block) {
  // Debug: Log the block structure
  console.log('Meta-links block structure:', block);
  console.log('Block children:', block.children);
  
  // Create container for all links
  const linksContainer = document.createElement('div');
  linksContainer.className = 'meta-links-container';

  // Create links list
  const linksList = document.createElement('ul');
  linksList.className = 'meta-links-list';

  // Process each row as a separate link item
  [...block.children].forEach((row, index) => {
    console.log(`Processing row ${index}:`, row);
    console.log(`Row innerHTML:`, row.innerHTML);
    console.log(`Row children:`, row.children);
    
    const listItem = document.createElement('li');
    listItem.className = 'meta-links-item';
    
    // Move instrumentation for Universal Editor
    moveInstrumentation(row, listItem);

    const cells = Array.from(row.children);
    console.log(`Row ${index} cells:`, cells);

    let linkUrl = '';
    let linkText = '';
    let linkTitle = '';

    // Extract data from the row cells
    // The Universal Editor generates everything in a single cell with this structure:
    // <div><p class="button-container"><a href="#" title="..." class="button">Link Text</a></p></div>
    
    if (cells.length >= 1) {
      const firstCell = cells[0];
      console.log(`First cell:`, firstCell, firstCell.innerHTML);
      
      const linkElement = firstCell.querySelector('a');
      if (linkElement) {
        // Extract URL from href attribute
        linkUrl = linkElement.href;
        console.log(`Found link URL:`, linkUrl);
        
        // Extract text from link content
        linkText = linkElement.textContent.trim();
        console.log(`Found link text:`, linkText);
        
        // Extract title from title attribute
        linkTitle = linkElement.title || '';
        console.log(`Found link title:`, linkTitle);
      } else {
        console.log(`No link element found in cell`);
      }
    }

    console.log(`Extracted data - URL: "${linkUrl}", Text: "${linkText}", Title: "${linkTitle}"`);

    // Create the link element if we have URL and text
    if (linkUrl && linkText) {
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'meta-links-link-wrapper';

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

      linkWrapper.appendChild(linkElement);

      // Add title as subtitle if provided
      if (linkTitle) {
        const titleElement = document.createElement('p');
        titleElement.className = 'meta-links-description';
        titleElement.textContent = linkTitle;
        linkWrapper.appendChild(titleElement);
      }

      listItem.appendChild(linkWrapper);
      console.log(`Created link wrapper for row ${index}`);
    } else {
      console.log(`Skipping row ${index} - missing URL or text`);
      // Add debug info to the list item
      const debugInfo = document.createElement('div');
      debugInfo.textContent = `Debug: URL="${linkUrl}", Text="${linkText}", Title="${linkTitle}"`;
      debugInfo.style.color = 'red';
      debugInfo.style.fontSize = '12px';
      listItem.appendChild(debugInfo);
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
