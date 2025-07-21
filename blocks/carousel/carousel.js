import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const CAROUSEL_CONFIG = {
  SLIDE_TRANSITION_DURATION: 300,
  AUTO_PLAY_INTERVAL: 5000,
  TOUCH_THRESHOLD: 50,
  BREAKPOINTS: {
    MOBILE: 600,
    DESKTOP: 900
  }
};

export default function decorate(block) {
  const slides = [...block.children];
  
  if (slides.length === 0) return;

  // Check for variations
  const hasAutoPlay = block.classList.contains('auto-play');
  const showDots = !block.classList.contains('no-dots');
  const showArrows = !block.classList.contains('no-arrows');

  // Create carousel container structure
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';
  
  const carouselTrack = document.createElement('div');
  carouselTrack.className = 'carousel-track';
  
  // Process slides
  slides.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.dataset.slideIndex = index;
    
    moveInstrumentation(row, slide);
    
    // Move content from row to slide
    while (row.firstElementChild) {
      const element = row.firstElementChild;
      
      // Handle images
      if (element.querySelector('picture')) {
        element.className = 'carousel-slide-image';
      } else if (element.textContent.trim()) {
        element.className = 'carousel-slide-content';
      }
      
      slide.append(element);
    }
    
    carouselTrack.append(slide);
  });

  // Optimize images
  carouselTrack.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src, 
      img.alt, 
      false, 
      [{ width: '750' }, { width: '1200' }]
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Create navigation arrows
  let prevButton, nextButton;
  if (showArrows) {
    const arrowsContainer = document.createElement('div');
    arrowsContainer.className = 'carousel-arrows';
    
    prevButton = document.createElement('button');
    prevButton.className = 'carousel-arrow carousel-prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = '<span class="carousel-arrow-icon"></span>';
    
    nextButton = document.createElement('button');
    nextButton.className = 'carousel-arrow carousel-next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = '<span class="carousel-arrow-icon"></span>';
    
    arrowsContainer.append(prevButton, nextButton);
    carouselContainer.append(arrowsContainer);
  }

  // Create dots navigation
  let dotsContainer;
  if (showDots && slides.length > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.dataset.slideIndex = index;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      dotsContainer.append(dot);
    });
  }

  // Assemble carousel
  carouselContainer.append(carouselTrack);
  if (dotsContainer) carouselContainer.append(dotsContainer);
  
  // Replace block content
  block.textContent = '';
  block.append(carouselContainer);

  // Initialize carousel functionality
  initializeCarousel(block, carouselTrack, slides.length, {
    prevButton,
    nextButton,
    dotsContainer,
    hasAutoPlay
  });
}

function initializeCarousel(block, track, slideCount, options) {
  let currentSlide = 0;
  let autoPlayTimer;
  let touchStartX = 0;
  let touchEndX = 0;
  let isTransitioning = false;

  const { prevButton, nextButton, dotsContainer, hasAutoPlay } = options;

  // Update carousel position
  function updateCarousel(slideIndex, animate = true) {
    if (isTransitioning) return;
    
    currentSlide = Math.max(0, Math.min(slideIndex, slideCount - 1));
    const translateX = -currentSlide * 100;
    
    if (animate) {
      isTransitioning = true;
      track.style.transition = `transform ${CAROUSEL_CONFIG.SLIDE_TRANSITION_DURATION}ms ease-in-out`;
      setTimeout(() => {
        isTransitioning = false;
      }, CAROUSEL_CONFIG.SLIDE_TRANSITION_DURATION);
    }
    
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update active states
    track.querySelectorAll('.carousel-slide').forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
    
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }

    // Update arrow states
    if (prevButton) prevButton.disabled = currentSlide === 0;
    if (nextButton) nextButton.disabled = currentSlide === slideCount - 1;
  }

  // Auto-play functionality
  function startAutoPlay() {
    if (!hasAutoPlay || slideCount <= 1) return;
    
    autoPlayTimer = setInterval(() => {
      const nextIndex = currentSlide < slideCount - 1 ? currentSlide + 1 : 0;
      updateCarousel(nextIndex);
    }, CAROUSEL_CONFIG.AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Touch/swipe support
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    stopAutoPlay();
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > CAROUSEL_CONFIG.TOUCH_THRESHOLD) {
      if (swipeDistance > 0 && currentSlide < slideCount - 1) {
        updateCarousel(currentSlide + 1);
      } else if (swipeDistance < 0 && currentSlide > 0) {
        updateCarousel(currentSlide - 1);
      }
    }
    
    if (hasAutoPlay) {
      setTimeout(startAutoPlay, 1000); // Restart auto-play after 1 second
    }
  }

  // Event listeners
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      stopAutoPlay();
      updateCarousel(currentSlide - 1);
      if (hasAutoPlay) setTimeout(startAutoPlay, 3000);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      stopAutoPlay();
      updateCarousel(currentSlide + 1);
      if (hasAutoPlay) setTimeout(startAutoPlay, 3000);
    });
  }

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-dot')) {
        stopAutoPlay();
        const slideIndex = parseInt(e.target.dataset.slideIndex, 10);
        updateCarousel(slideIndex);
        if (hasAutoPlay) setTimeout(startAutoPlay, 3000);
      }
    });
  }

  // Touch events
  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Pause auto-play on hover
  if (hasAutoPlay) {
    block.addEventListener('mouseenter', stopAutoPlay);
    block.addEventListener('mouseleave', startAutoPlay);
  }

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 0) {
      e.preventDefault();
      stopAutoPlay();
      updateCarousel(currentSlide - 1);
      if (hasAutoPlay) setTimeout(startAutoPlay, 3000);
    } else if (e.key === 'ArrowRight' && currentSlide < slideCount - 1) {
      e.preventDefault();
      stopAutoPlay();
      updateCarousel(currentSlide + 1);
      if (hasAutoPlay) setTimeout(startAutoPlay, 3000);
    }
  });

  // Initialize
  updateCarousel(0, false);
  
  if (hasAutoPlay && slideCount > 1) {
    setTimeout(startAutoPlay, 2000); // Start auto-play after 2 seconds
  }

  // Handle window resize
  const handleResize = () => {
    track.style.transition = 'none';
    updateCarousel(currentSlide, false);
    setTimeout(() => {
      track.style.transition = '';
    }, 50);
  };

  window.addEventListener('resize', handleResize);

  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (hasAutoPlay && slideCount > 1) {
          startAutoPlay();
        }
      } else {
        stopAutoPlay();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(block);
} 