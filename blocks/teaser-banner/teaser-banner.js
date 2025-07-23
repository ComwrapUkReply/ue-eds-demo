import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Teaser Banner Block Configuration
 * Displays a full-width banner with background media and content in bottom left corner
 */
const TEASER_BANNER_CONFIG = {
  VIDEO_FORMATS: ['mp4', 'webm', 'mov'],
  IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  POSTER_WIDTH: '1200'
};

/**
 * Determines if the provided URL is a video file
 * @param {string} url - The media URL to check
 * @returns {boolean} - True if the URL is a video file
 */
function isVideoFile(url) {
  if (!url) return false;
  const extension = url.split('.').pop().toLowerCase();
  return TEASER_BANNER_CONFIG.VIDEO_FORMATS.includes(extension);
}

/**
 * Creates a video element with proper attributes
 * @param {string} videoSrc - The video source URL
 * @param {string} posterSrc - Optional poster image URL
 * @returns {HTMLVideoElement} - Configured video element
 */
function createVideoElement(videoSrc, posterSrc = null) {
  const video = document.createElement('video');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.classList.add('teaser-banner-video');
  
  if (posterSrc) {
    video.setAttribute('poster', posterSrc);
  }
  
  const source = document.createElement('source');
  source.src = videoSrc;
  source.type = `video/${videoSrc.split('.').pop().toLowerCase()}`;
  video.appendChild(source);
  
  return video;
}



/**
 * Main decoration function for the teaser-banner block
 * @param {HTMLElement} block - The teaser-banner block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];
  
  // eslint-disable-next-line no-console
  console.log('Teaser Banner: Processing', rows.length, 'rows');
  
  if (rows.length < 2) {
    // eslint-disable-next-line no-console
    console.warn('Teaser Banner block requires at least 2 rows: media and content');
    return;
  }
  
  // Clear the block content
  block.textContent = '';
  
  // Create the media container
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'teaser-banner-media';
  
  // Process the first row (media)
  const mediaRow = rows[0];
  const mediaCell = mediaRow.firstElementChild;
  
  if (mediaCell) {
    const img = mediaCell.querySelector('img');
    const link = mediaCell.querySelector('a');
    
    let mediaSrc = null;
    let altText = '';
    
    if (img) {
      mediaSrc = img.src;
      altText = img.alt || 'Teaser banner media';
    } else if (link) {
      mediaSrc = link.href;
      altText = link.textContent || 'Teaser banner media';
    }
    
    if (mediaSrc) {
      if (isVideoFile(mediaSrc)) {
        // Create video element
        const video = createVideoElement(mediaSrc);
        mediaContainer.appendChild(video);
      } else {
        // Create optimized picture element
        const picture = createOptimizedPicture(
          mediaSrc,
          altText,
          false,
          [{ width: '1200' }, { width: '750' }]
        );
        
        // Move instrumentation if present
        if (img) {
          moveInstrumentation(img, picture.querySelector('img'));
        }
        
        mediaContainer.appendChild(picture);
      }
    }
  }
  
  // Process all remaining rows as content (combine them)
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-banner-content';
  
  // Process rows starting from index 1 (all content rows)
  for (let i = 1; i < rows.length; i += 1) {
    const contentRow = rows[i];
    const contentCell = contentRow.firstElementChild;
    
    // eslint-disable-next-line no-console  
    console.log(`Teaser Banner: Processing content row ${i}:`, contentCell);
    
    if (contentCell) {
      // Process all children in this cell
      const elements = [...contentCell.children];
      
      // eslint-disable-next-line no-console
      console.log(`Teaser Banner: Row ${i} has ${elements.length} elements:`, elements.map(el => `${el.tagName}: ${el.textContent?.trim()}`));
      
      elements.forEach((element) => {
        // Clone the element to avoid moving it
        const clonedElement = element.cloneNode(true);
        
        // Assign appropriate classes based on element type
        if (clonedElement.tagName === 'H1' || clonedElement.tagName === 'H2' || clonedElement.tagName === 'H3') {
          clonedElement.className = 'teaser-banner-title';
          // eslint-disable-next-line no-console
          console.log('Teaser Banner: Added title:', clonedElement.textContent);
        } else if (clonedElement.tagName === 'P' && !clonedElement.querySelector('a')) {
          clonedElement.className = 'teaser-banner-description';
          // eslint-disable-next-line no-console
          console.log('Teaser Banner: Added description:', clonedElement.textContent);
        } else if (clonedElement.tagName === 'P' && clonedElement.querySelector('a')) {
          const link = clonedElement.querySelector('a');
          link.className = 'teaser-banner-button';
          clonedElement.className = 'teaser-banner-button-container';
          // eslint-disable-next-line no-console
          console.log('Teaser Banner: Added button:', link.textContent, 'href:', link.href);
        }
        
        contentContainer.appendChild(clonedElement);
      });
    }
  }
  
  // Create the banner wrapper
  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'teaser-banner-wrapper';
  
  // Add media container
  bannerWrapper.appendChild(mediaContainer);
  
  // Add content container
  bannerWrapper.appendChild(contentContainer);
  
  // Add everything to the block
  block.appendChild(bannerWrapper);
  
  // Move any existing instrumentation
  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
} 