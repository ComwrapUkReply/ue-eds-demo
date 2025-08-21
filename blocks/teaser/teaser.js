import { createOptimizedPicture } from '../../scripts/aem.js';
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
  const rows = [...block.children];
  
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
  rows.forEach((row) => {
    const cells = [...row.children];
    
    cells.forEach((cell) => {
      const elements = [...cell.children];
      
      elements.forEach((element) => {
        // Check for image
        const img = element.querySelector('img');
        if (img && !imageElement) {
          imageElement = img;
          return;
        }

        // Check for headings (title)
        if ((element.tagName === 'H1' || element.tagName === 'H2' || 
             element.tagName === 'H3' || element.tagName === 'H4') && !titleElement) {
          titleElement = element.cloneNode(true);
          return;
        }

        // Check for links (CTA button)
        const link = element.querySelector('a');
        if (link && !linkElement) {
          linkElement = link.cloneNode(true);
          return;
        }

        // Check for paragraph text (description)
        if (element.tagName === 'P' && !element.querySelector('a') && !descriptionElement) {
          descriptionElement = element.cloneNode(true);
          return;
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
}