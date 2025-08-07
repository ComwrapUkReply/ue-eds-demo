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

  // Create carousel controls (play/pause + dots)
  let controlsContainer, playPauseButton, dotsContainer, progressBar;
  if (showDots && slides.length > 1) {
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls';
    
    // Play/Pause button
    playPauseButton = document.createElement('button');
    playPauseButton.className = 'carousel-play-pause';
    playPauseButton.setAttribute('aria-label', hasAutoPlay ? 'Pause carousel' : 'Play carousel');
    playPauseButton.innerHTML = '<span class="carousel-play-pause-icon"></span>';
    
    // Dots container
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    
    // Progress bar (first element)
    progressBar = document.createElement('div');
    progressBar.className = 'carousel-progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'carousel-progress-fill';
    progressBar.append(progressFill);
    dotsContainer.append(progressBar);
    
    // Dots
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.dataset.slideIndex = index;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      dotsContainer.append(dot);
    });
    
    controlsContainer.append(playPauseButton, dotsContainer);
  }

  // Assemble carousel
  carouselContainer.append(carouselTrack);
  if (controlsContainer) carouselContainer.append(controlsContainer);
  
  // Replace block content
  block.textContent = '';
  block.append(carouselContainer);

  // Initialize carousel functionality
  initializeCarousel(block, carouselTrack, slides.length, {
    prevButton,
    nextButton,
    dotsContainer,
    playPauseButton,
    progressBar,
    hasAutoPlay
  });
}

function initializeCarousel(block, track, slideCount, options) {
  let currentSlide = 0;
  let autoPlayTimer;
  let touchStartX = 0;
  let touchEndX = 0;
  let isTransitioning = false;
  let isPlaying = hasAutoPlay;

  const { prevButton, nextButton, dotsContainer, playPauseButton, progressBar, hasAutoPlay } = options;

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
    
    // Update progress bar
    if (progressBar) {
      const progressFill = progressBar.querySelector('.carousel-progress-fill');
      const progress = ((currentSlide + 1) / slideCount) * 100;
      progressFill.style.width = `${progress}%`;
    }
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
    isPlaying = false;
    updatePlayPauseButton();
  }
  
  function updatePlayPauseButton() {
    if (playPauseButton) {
      playPauseButton.setAttribute('aria-label', isPlaying ? 'Pause carousel' : 'Play carousel');
      playPauseButton.innerHTML = isPlaying ? 
        '<span class="carousel-pause-icon">⏸</span>' : 
        '<span class="carousel-play-icon">▶</span>';
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
    
    if (hasAutoPlay && isPlaying) {
      setTimeout(() => {
        startAutoPlay();
        isPlaying = true;
        updatePlayPauseButton();
      }, 1000); // Restart auto-play after 1 second
    }
  }

  // Event listeners
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      stopAutoPlay();
      updateCarousel(currentSlide - 1);
      if (hasAutoPlay && isPlaying) {
        setTimeout(() => {
          startAutoPlay();
          isPlaying = true;
          updatePlayPauseButton();
        }, 3000);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      stopAutoPlay();
      updateCarousel(currentSlide + 1);
      if (hasAutoPlay && isPlaying) {
        setTimeout(() => {
          startAutoPlay();
          isPlaying = true;
          updatePlayPauseButton();
        }, 3000);
      }
    });
  }
  
  // Play/Pause button event listener
  if (playPauseButton) {
    playPauseButton.addEventListener('click', () => {
      if (isPlaying) {
        stopAutoPlay();
      } else {
        isPlaying = true;
        startAutoPlay();
        updatePlayPauseButton();
      }
    });
  }

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('carousel-dot')) {
        stopAutoPlay();
        const slideIndex = parseInt(e.target.dataset.slideIndex, 10);
        updateCarousel(slideIndex);
        if (hasAutoPlay && isPlaying) {
          setTimeout(() => {
            startAutoPlay();
            isPlaying = true;
            updatePlayPauseButton();
          }, 3000);
        }
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
      if (hasAutoPlay && isPlaying) {
        setTimeout(() => {
          startAutoPlay();
          isPlaying = true;
          updatePlayPauseButton();
        }, 3000);
      }
    } else if (e.key === 'ArrowRight' && currentSlide < slideCount - 1) {
      e.preventDefault();
      stopAutoPlay();
      updateCarousel(currentSlide + 1);
      if (hasAutoPlay && isPlaying) {
        setTimeout(() => {
          startAutoPlay();
          isPlaying = true;
          updatePlayPauseButton();
        }, 3000);
      }
    }
  });

  // Initialize
  updateCarousel(0, false);
  updatePlayPauseButton();
  
  if (hasAutoPlay && slideCount > 1) {
    isPlaying = true;
    setTimeout(() => {
      startAutoPlay();
      updatePlayPauseButton();
    }, 2000); // Start auto-play after 2 seconds
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