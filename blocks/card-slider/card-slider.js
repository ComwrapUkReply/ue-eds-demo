import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Card Slider configuration grouped in a single object
const SLIDER_CONFIG = {
  slidesPerScroll: 1,
  imageMaxWidth: '750',
};

// Centralized class names/selectors
const SELECTORS = {
  viewport: 'card-slider-viewport',
  list: 'card-slider-list',
  navButton: 'card-slider-button',
  prev: 'card-slider-prev',
  next: 'card-slider-next',
};

/**
 * Build cards markup similar to the `cards` block, so we can reuse its styles/patterns.
 * @param {HTMLElement} block
 * @returns {HTMLUListElement}
 */
function buildCardsList(block) {
  const ul = document.createElement('ul');
  ul.classList.add(SELECTORS.list);

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    ul.append(li);
  });

  // Optimize images like in the `cards` block
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: SLIDER_CONFIG.imageMaxWidth }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  return ul;
}

/**
 * Scroll the list by a number of slides.
 * @param {HTMLElement} viewport
 * @param {HTMLUListElement} list
 * @param {number} direction -1 for prev, 1 for next
 */
function scrollBySlides(viewport, list, direction) {
  const firstSlide = list.querySelector('li');
  if (!firstSlide) return;

  const slideWidth = firstSlide.getBoundingClientRect().width;
  const delta = direction * SLIDER_CONFIG.slidesPerScroll * (slideWidth + parseFloat(getComputedStyle(list).columnGap || getComputedStyle(list).gap || 0));
  viewport.scrollBy({ left: delta, behavior: 'smooth' });
}

/**
 * Create a navigation button element.
 * @param {string} type 'prev' | 'next'
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
function createNavButton(type, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${SELECTORS.navButton} ${type === 'prev' ? SELECTORS.prev : SELECTORS.next}`;
  button.setAttribute('aria-label', type === 'prev' ? 'Previous' : 'Next');
  button.innerHTML = type === 'prev' ? '&#10094;' : '&#10095;';
  button.addEventListener('click', onClick);
  return button;
}

export default function decorate(block) {
  // Guard: no children to decorate
  if (!block || !block.children || block.children.length === 0) return;

  // Build the cards list reusing the `cards` structure/classes
  const list = buildCardsList(block);

  // Create wrapper and viewport to align with block class conventions
  const wrapper = document.createElement('div');
  wrapper.className = 'card-slider-wrapper';

  const viewport = document.createElement('div');
  viewport.classList.add(SELECTORS.viewport);
  viewport.append(list);

  // Clear block and append viewport and controls
  block.textContent = '';
  wrapper.append(viewport);
  block.append(wrapper);

  const handlePrev = () => scrollBySlides(viewport, list, -1);
  const handleNext = () => scrollBySlides(viewport, list, 1);

  const prevBtn = createNavButton('prev', handlePrev);
  const nextBtn = createNavButton('next', handleNext);

  wrapper.append(prevBtn, nextBtn);

  // Keyboard support when block is focused
  block.setAttribute('tabindex', '0');
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  });
}


