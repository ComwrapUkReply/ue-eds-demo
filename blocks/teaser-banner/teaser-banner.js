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
 * Creates the content container with title, description, and button
 * @param {HTMLElement} contentDiv - The div containing the text content
 * @returns {HTMLElement} - Styled content container
 */
function createContentContainer(contentDiv) {
  const contentContainer = document.createElement('div');
  contentContainer.className = 'teaser-banner-content';
  
  // Process existing content elements
  const elements = [...contentDiv.children];
  elements.forEach((element) => {
    if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
      element.className = 'teaser-banner-title';
    } else if (element.tagName === 'P' && !element.querySelector('a')) {
      element.className = 'teaser-banner-description';
    } else if (element.tagName === 'P' && element.querySelector('a')) {
      const link = element.querySelector('a');
      link.className = 'teaser-banner-button';
      element.className = 'teaser-banner-button-container';
    }
    contentContainer.appendChild(element);
  });
  
  return contentContainer;
}

/**
 * Main decoration function for the teaser-banner block
 * @param {HTMLElement} block - The teaser-banner block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];
  
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
  
  // Process the second row (content)
  const contentRow = rows[1];
  const contentCell = contentRow.firstElementChild;
  
  let contentContainer = null;
  if (contentCell) {
    contentContainer = createContentContainer(contentCell);
  }
  
  // Create the banner wrapper
  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'teaser-banner-wrapper';
  
  // Add media container
  bannerWrapper.appendChild(mediaContainer);
  
  // Add content container if it exists
  if (contentContainer) {
    bannerWrapper.appendChild(contentContainer);
  }
  
  // Add everything to the block
  block.appendChild(bannerWrapper);
  
  // Move any existing instrumentation
  if (rows.length > 0) {
    moveInstrumentation(rows[0], block);
  }
} 