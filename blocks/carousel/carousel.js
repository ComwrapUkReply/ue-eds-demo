import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const CAROUSEL_CONFIG = {
  SLIDE_TRANSITION_DURATION: 300,
  DEFAULT_AUTO_PLAY_INTERVAL: 6000,
  TOUCH_THRESHOLD: 50,
  BREAKPOINTS: {
    MOBILE: 600,
    DESKTOP: 900
  }
};

export default function decorate(block) {
  const slides = [...block.children];
  
  if (slides.length === 0) return;

  // Read configuration from block data attributes or use defaults
  const config = {
    autoplay: block.dataset.autoplay !== 'false' && !block.classList.contains('no-auto-play'),
    interval: parseInt(block.dataset.interval, 10) || 6,
    loop: block.dataset.loop !== 'false',
    showDots: block.dataset.showDots !== 'false' && !block.classList.contains('no-dots'),
    showArrows: block.dataset.showArrows === 'true' || !block.classList.contains('no-arrows')
  };

  // For backward compatibility with class-based configuration
  const hasAutoPlay = config.autoplay;
  const showDots = config.showDots;
  const showArrows = config.showArrows;
  const slideInterval = config.interval * 1000; // Convert to milliseconds
  const enableLoop = config.loop;

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
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'carousel-slide-content';
    
    // Process each element in the row
    const elements = [...row.children];
    elements.forEach((element) => {
      // Handle images
      if (element.querySelector('picture')) {
        element.className = 'carousel-slide-image';
        slide.append(element);
      } else if (element.textContent.trim()) {
        // Determine if it's title or text based on content or position
        const isTitle = element.querySelector('h1, h2, h3, h4, h5, h6') || 
                       elements.indexOf(element) === elements.findIndex(el => !el.querySelector('picture'));
        
        if (isTitle) {
          const titleDiv = document.createElement('div');
          titleDiv.className = 'carousel-slide-content-title';
          titleDiv.innerHTML = element.innerHTML;
          moveInstrumentation(element, titleDiv);
          contentContainer.append(titleDiv);
        } else {
          const textDiv = document.createElement('div');
          textDiv.className = 'carousel-slide-content-text';
          textDiv.innerHTML = element.innerHTML;
          moveInstrumentation(element, textDiv);
          contentContainer.append(textDiv);
        }
      }
    });
    
    // Only append content container if it has children
    if (contentContainer.children.length > 0) {
      slide.append(contentContainer);
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
    hasAutoPlay,
    slideInterval,
    enableLoop
  });
}

function initializeCarousel(block, track, slideCount, options) {
  let currentSlide = 0;
  let autoPlayTimer;
  let progressTimer;
  let touchStartX = 0;
  let touchEndX = 0;
  let isTransitioning = false;
  let progressStartTime = 0;

  const { prevButton, nextButton, dotsContainer, playPauseButton, progressBar, hasAutoPlay, slideInterval, enableLoop } = options;
  let isPlaying = hasAutoPlay;
  const autoPlayInterval = slideInterval || CAROUSEL_CONFIG.DEFAULT_AUTO_PLAY_INTERVAL;

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

    // Update arrow states based on loop setting
    if (prevButton) {
      prevButton.disabled = !enableLoop && currentSlide === 0;
    }
    if (nextButton) {
      nextButton.disabled = !enableLoop && currentSlide === slideCount - 1;
    }
    
    // Reset progress bar for new slide
    if (progressBar && isPlaying && hasAutoPlay) {
      progressStartTime = Date.now();
      updateProgressBar();
    }
  }

  // Auto-play functionality
  function startAutoPlay() {
    if (!hasAutoPlay || slideCount <= 1) return;
    
    progressStartTime = Date.now();
    updateProgressBar();
    
    autoPlayTimer = setInterval(() => {
      let nextIndex;
      if (enableLoop) {
        // Loop: go to first slide after last slide
        nextIndex = currentSlide < slideCount - 1 ? currentSlide + 1 : 0;
      } else {
        // No loop: stop at last slide
        nextIndex = currentSlide < slideCount - 1 ? currentSlide + 1 : currentSlide;
        if (nextIndex === currentSlide) {
          // Stop autoplay when reaching the end
          stopAutoPlay();
          return;
        }
      }
      updateCarousel(nextIndex);
      progressStartTime = Date.now(); // Reset progress timer
    }, autoPlayInterval);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
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

  // Update progress bar to show actual autoscroll progress
  function updateProgressBar() {
    if (!progressBar || !isPlaying || !hasAutoPlay) return;
    
    // Clear any existing progress timer
    if (progressTimer) {
      clearInterval(progressTimer);
    }
    
    // Reset progress bar
    const progressFill = progressBar.querySelector('.carousel-progress-fill');
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    
    progressTimer = setInterval(() => {
      const elapsed = Date.now() - progressStartTime;
      const progress = Math.min((elapsed / autoPlayInterval) * 100, 100);
      
      if (progressFill && isPlaying) {
        progressFill.style.width = `${progress}%`;
      }
      
      if (progress >= 100 || !isPlaying) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }, 50); // Update every 50ms for smooth animation
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
      let prevIndex;
      if (enableLoop) {
        prevIndex = currentSlide > 0 ? currentSlide - 1 : slideCount - 1;
      } else {
        prevIndex = Math.max(0, currentSlide - 1);
      }
      updateCarousel(prevIndex);
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
      let nextIndex;
      if (enableLoop) {
        nextIndex = currentSlide < slideCount - 1 ? currentSlide + 1 : 0;
      } else {
        nextIndex = Math.min(slideCount - 1, currentSlide + 1);
      }
      updateCarousel(nextIndex);
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
        updatePlayPauseButton();
        startAutoPlay();
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
    if (e.key === 'ArrowLeft' && (enableLoop || currentSlide > 0)) {
      e.preventDefault();
      stopAutoPlay();
      const prevIndex = enableLoop && currentSlide === 0 ? slideCount - 1 : currentSlide - 1;
      updateCarousel(prevIndex);
      if (hasAutoPlay && isPlaying) {
        setTimeout(() => {
          startAutoPlay();
          isPlaying = true;
          updatePlayPauseButton();
        }, 3000);
      }
    } else if (e.key === 'ArrowRight' && (enableLoop || currentSlide < slideCount - 1)) {
      e.preventDefault();
      stopAutoPlay();
      const nextIndex = enableLoop && currentSlide === slideCount - 1 ? 0 : currentSlide + 1;
      updateCarousel(nextIndex);
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
  
  // Start autoplay immediately if enabled and multiple slides
  if (hasAutoPlay && slideCount > 1) {
    isPlaying = true;
    startAutoPlay();
    updatePlayPauseButton();
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
        if (hasAutoPlay && slideCount > 1 && !isPlaying) {
          isPlaying = true;
          startAutoPlay();
          updatePlayPauseButton();
        }
      } else {
        if (isPlaying) {
          stopAutoPlay();
        }
      }
    });
  }, { threshold: 0.5 });

  observer.observe(block);
} 