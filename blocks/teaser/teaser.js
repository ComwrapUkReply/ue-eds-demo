import { createOptimizedPicture } from '../../scripts/aem.js';
/**
 * The moveInstrumentation function is used to transfer data attributes and tracking information
 * from the original block element to the newly created elements during block decoration.
 * This ensures that analytics, testing, and other instrumentation data is preserved
 * when the DOM structure is modified during the decoration process.
 * 
 * It's commonly used in Adobe Edge Delivery Services (Franklin) blocks to maintain
 * tracking capabilities after DOM manipulation.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Teaser Component Configuration
 * A flexible teaser component that displays image, title, description, and optional CTA
 */
const TEASER_CONFIG = {
  IMAGE_WIDTHS: [{ width: '400' }, { width: '600' }, { width: '800' }],
  DEFAULT_IMAGE_WIDTH: '600'
};

/**
 * Creates a teaser card element with image, content, and optional link
 * @param {HTMLElement} block - The teaser block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-console
  console.log('Teaser block decorate function called', block);
  
  const rows = [...block.children];
  
  // eslint-disable-next-line no-console
  console.log('Teaser block rows:', rows.length, rows);
  
  if (rows.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Teaser block requires at least one row with content');
    return;
  }

  // Clear the block content
  block.textContent = '';

  // Create the teaser wrapper
  const teaserWrapper = document.createElement('div');
  teaserWrapper.className = 'teaser-wrapper';

  let imageElement = null;
  let titleElement = null;
  let descriptionElement = null;
  let linkElement = null;

  // Process all rows to extract content
  rows.forEach((row, rowIndex) => {
    // eslint-disable-next-line no-console
    console.log(`Processing row ${rowIndex}:`, row);
    
    const cells = [...row.children];
    
    cells.forEach((cell, cellIndex) => {
      // eslint-disable-next-line no-console
      console.log(`Processing cell ${cellIndex}:`, cell);
      
      const elements = [...cell.children];
      
      // If no child elements, check if the cell itself has content
      if (elements.length === 0 && cell.textContent.trim()) {
        const textContent = cell.textContent.trim();
        // eslint-disable-next-line no-console
        console.log('Cell has direct text content:', textContent);
        
        // Try to determine what type of content this is
        if (!titleElement && textContent.length > 5 && textContent.length < 100) {
          const h2 = document.createElement('h2');
          h2.textContent = textContent;
          titleElement = h2;
          // eslint-disable-next-line no-console
          console.log('Found title in cell text:', titleElement.textContent);
        } else if (!descriptionElement && textContent.length > 20) {
          const p = document.createElement('p');
          p.textContent = textContent;
          descriptionElement = p;
          // eslint-disable-next-line no-console
          console.log('Found description in cell text:', descriptionElement.textContent);
        }
      }
      
      elements.forEach((element, elementIndex) => {
        // eslint-disable-next-line no-console
        console.log(`Processing element ${elementIndex}:`, element.tagName, element.textContent?.trim());
        
        // Check for image (in picture or img tags)
        const img = element.querySelector('img') || (element.tagName === 'IMG' ? element : null);
        const picture = element.querySelector('picture') || (element.tagName === 'PICTURE' ? element : null);
        
        if ((img || picture) && !imageElement) {
          imageElement = img || picture.querySelector('img');
          // eslint-disable-next-line no-console
          console.log('Found image:', imageElement?.src);
          return;
        }

        // Check for headings (title)
        if ((element.tagName === 'H1' || element.tagName === 'H2' || 
             element.tagName === 'H3' || element.tagName === 'H4') && !titleElement) {
          titleElement = element.cloneNode(true);
          // eslint-disable-next-line no-console
          console.log('Found title:', titleElement.textContent);
          return;
        }
        
        // Check for DIV with title-like content (Universal Editor structure)
        if (element.tagName === 'DIV' && element.textContent?.trim() && !titleElement) {
          const textContent = element.textContent.trim();
          // Skip very long content (likely descriptions) and empty content
          if (textContent.length > 5 && textContent.length < 100 && !textContent.includes('\n')) {
            const h2 = document.createElement('h2');
            h2.textContent = textContent;
            titleElement = h2;
            // eslint-disable-next-line no-console
            console.log('Found title in DIV:', titleElement.textContent);
            return;
          }
        }

        // Check for links (CTA button)
        const link = element.querySelector('a');
        if (link && !linkElement) {
          linkElement = link.cloneNode(true);
          // eslint-disable-next-line no-console
          console.log('Found link:', linkElement.href, linkElement.textContent);
          return;
        }

        // Check for paragraph text (description)
        if (element.tagName === 'P' && !element.querySelector('a') && !descriptionElement) {
          descriptionElement = element.cloneNode(true);
          // eslint-disable-next-line no-console
          console.log('Found description:', descriptionElement.textContent);
          return;
        }
        
        // Check for DIV with description-like content (Universal Editor structure)
        if (element.tagName === 'DIV' && element.textContent?.trim() && !descriptionElement && titleElement) {
          const textContent = element.textContent.trim();
          // Look for longer text content that's likely a description
          if (textContent.length > 20) {
            const p = document.createElement('p');
            p.textContent = textContent;
            descriptionElement = p;
            // eslint-disable-next-line no-console
            console.log('Found description in DIV:', descriptionElement.textContent);
            return;
          }
        }
      });
    });
  });

  // Create image container
  if (imageElement) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'teaser-image';
    
    const optimizedPicture = createOptimizedPicture(
      imageElement.src,
      imageElement.alt || 'Teaser image',
      false,
      TEASER_CONFIG.IMAGE_WIDTHS
    );
    
    // Move instrumentation if present
    moveInstrumentation(imageElement, optimizedPicture.querySelector('img'));
    
    imageContainer.appendChild(optimizedPicture);
    teaserWrapper.appendChild(imageContainer);
  }

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-content';

  // Add title
  if (titleElement) {
    titleElement.className = 'teaser-title';
    contentContainer.appendChild(titleElement);
  }

  // Add description
  if (descriptionElement) {
    descriptionElement.className = 'teaser-description';
    contentContainer.appendChild(descriptionElement);
  }

  // Add CTA button
  if (linkElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'teaser-button-container';
    
    linkElement.className = 'teaser-button';
    buttonContainer.appendChild(linkElement);
    contentContainer.appendChild(buttonContainer);
  }

  teaserWrapper.appendChild(contentContainer);

  // If there's a link, make the entire teaser clickable (but keep button as primary CTA)
  if (linkElement && linkElement.href) {
    teaserWrapper.addEventListener('click', (e) => {
      // Don't trigger if clicking on the button itself
      if (e.target.closest('.teaser-button')) {
        return;
      }
      window.open(linkElement.href, linkElement.target || '_self');
    });
    teaserWrapper.style.cursor = 'pointer';
    teaserWrapper.setAttribute('role', 'button');
    teaserWrapper.setAttribute('tabindex', '0');
    
    // Add keyboard support
    teaserWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.open(linkElement.href, linkElement.target || '_self');
      }
    });
  }

  // Add the wrapper to the block
  block.appendChild(teaserWrapper);

  // Move any existing instrumentation
  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
  
  // eslint-disable-next-line no-console
  console.log('Teaser block decoration completed. Final block:', block);
  // eslint-disable-next-line no-console
  console.log('Elements found - Image:', !!imageElement, 'Title:', !!titleElement, 'Description:', !!descriptionElement, 'Link:', !!linkElement);
}