/**
 * Dynamic Blog Block - Fetches posts from blog, articles, and news directories
 * Automatically updates when content is published
 */

/**
 * Fetches posts from the query index
 * @param {string} indexUrl - URL to the query index
 * @returns {Promise<Array>} Array of posts
 */
async function fetchPosts(indexUrl = '/query-index.json') {
  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Filters posts from blog, articles, and news directories
 * @param {Array} posts - All posts from index
 * @returns {Array} Filtered posts
 */
function filterBlogPosts(posts) {
  return posts.filter(post => {
    const path = post.path.toLowerCase();
    return path.startsWith('/blog/') || 
           path.startsWith('/articles/') || 
           path.startsWith('/news/');
  });
}

/**
 * Sorts posts by publication date (newest first)
 * @param {Array} posts - Posts to sort
 * @returns {Array} Sorted posts
 */
function sortPostsByDate(posts) {
  return posts.sort((a, b) => {
    const dateA = new Date(a.articlePublishDate || a.lastModified * 1000);
    const dateB = new Date(b.articlePublishDate || b.lastModified * 1000);
    return dateB - dateA;
  });
}

/**
 * Formats a date string for display
 * @param {string|number} date - Date string or timestamp
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Extracts category from path
 * @param {string} path - Post path
 * @returns {string} Category name
 */
function getCategoryFromPath(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  }
  return 'Post';
}

/**
 * Creates HTML for a single post
 * @param {Object} post - Post data
 * @returns {string} HTML string
 */
function createPostHTML(post) {
  const publishDate = formatDate(post.articlePublishDate || post.lastModified);
  const category = post.category || getCategoryFromPath(post.path);
  const readingTime = post.readingTime || '';
  const authors = post.authors || '';
  const topics = post.topics || '';
  const description = post.description || '';
  const title = post.title || 'Untitled Post';
  const image = post.image || '';

  return `
    <article class="blog-post" data-path="${post.path}">
      ${image ? `
        <div class="post-image">
          <img src="${image}" alt="${post.imageAlt || title}" loading="lazy" />
        </div>
      ` : ''}
      
      <div class="post-content">
        <div class="post-meta">
          <span class="post-category">${category}</span>
          ${publishDate ? `<span class="post-date">${publishDate}</span>` : ''}
          ${readingTime ? `<span class="reading-time">${readingTime}</span>` : ''}
        </div>
        
        <h2 class="post-title">
          <a href="${post.path}">${title}</a>
        </h2>
        
        ${description ? `<p class="post-description">${description}</p>` : ''}
        
        <div class="post-footer">
          ${authors ? `<span class="post-authors">By ${authors}</span>` : ''}
          ${topics ? `
            <div class="post-topics">
              ${topics.split(',').map(topic => 
                `<span class="topic-tag">${topic.trim()}</span>`
              ).join('')}
            </div>
          ` : ''}
        </div>
        
        <a href="${post.path}" class="read-more">Read More →</a>
      </div>
    </article>
  `;
}

/**
 * Renders all posts
 * @param {Array} posts - Posts to render
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Rendering options
 */
function renderPosts(posts, container, options = {}) {
  const {
    showFilters = true,
    postsPerPage = 10,
    showLoadMore = true
  } = options;

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="no-posts">
        <p>No posts found. Posts will appear here automatically when published.</p>
      </div>
    `;
    return;
  }

  const categories = [...new Set(posts.map(post => 
    post.category || getCategoryFromPath(post.path)
  ))];

  let html = '';

  // Add filters if enabled
  if (showFilters && categories.length > 1) {
    html += `
      <div class="blog-filters">
        <button class="filter-btn active" data-filter="all">All Posts</button>
        ${categories.map(category => 
          `<button class="filter-btn" data-filter="${category.toLowerCase()}">${category}</button>`
        ).join('')}
      </div>
    `;
  }

  // Add posts count
  html += `
    <div class="posts-count">
      Showing ${Math.min(postsPerPage, posts.length)} of ${posts.length} posts
    </div>
  `;

  // Add posts container
  html += '<div class="posts-container">';
  
  // Show initial posts
  const initialPosts = posts.slice(0, postsPerPage);
  html += initialPosts.map(post => createPostHTML(post)).join('');
  
  html += '</div>';

  // Add load more button if needed
  if (showLoadMore && posts.length > postsPerPage) {
    html += `
      <div class="load-more-container">
        <button class="load-more-btn" data-loaded="${postsPerPage}" data-total="${posts.length}">
          Load More Posts (${posts.length - postsPerPage} remaining)
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Sets up filtering functionality
 * @param {HTMLElement} block - Blog block element
 * @param {Array} posts - All posts
 */
function setupFiltering(block, posts) {
  const filterButtons = block.querySelectorAll('.filter-btn');
  const postsContainer = block.querySelector('.posts-container');
  const postsCount = block.querySelector('.posts-count');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter posts
      const filter = btn.dataset.filter;
      let filteredPosts = posts;
      
      if (filter !== 'all') {
        filteredPosts = posts.filter(post => {
          const category = (post.category || getCategoryFromPath(post.path)).toLowerCase();
          return category === filter;
        });
      }

      // Update display
      postsContainer.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
      postsCount.textContent = `Showing ${filteredPosts.length} posts`;
    });
  });
}

/**
 * Sets up load more functionality
 * @param {HTMLElement} block - Blog block element
 * @param {Array} posts - All posts
 */
function setupLoadMore(block, posts) {
  const loadMoreBtn = block.querySelector('.load-more-btn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', () => {
    const loaded = parseInt(loadMoreBtn.dataset.loaded);
    const total = parseInt(loadMoreBtn.dataset.total);
    const postsPerPage = 10;
    
    const nextBatch = posts.slice(loaded, loaded + postsPerPage);
    const postsContainer = block.querySelector('.posts-container');
    
    nextBatch.forEach(post => {
      postsContainer.insertAdjacentHTML('beforeend', createPostHTML(post));
    });

    const newLoaded = loaded + nextBatch.length;
    loadMoreBtn.dataset.loaded = newLoaded;

    if (newLoaded >= total) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.textContent = `Load More Posts (${total - newLoaded} remaining)`;
    }
  });
}

/**
 * Sets up auto-refresh functionality
 * @param {HTMLElement} block - Blog block element
 * @param {Function} refreshCallback - Function to call for refresh
 */
function setupAutoRefresh(block, refreshCallback) {
  // Check for updates every 5 minutes
  const refreshInterval = 5 * 60 * 1000; // 5 minutes
  
  setInterval(async () => {
    console.log('Checking for blog updates...');
    await refreshCallback();
  }, refreshInterval);

  // Also refresh when page becomes visible (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('Page became visible, checking for updates...');
      refreshCallback();
    }
  });
}

/**
 * Main decoration function
 * @param {HTMLElement} block - The dynamic blog block element
 */
export default async function decorate(block) {
  // Show loading state
  block.innerHTML = `
    <div class="blog-loading">
      <p>Loading posts...</p>
    </div>
  `;

  // Get configuration from block attributes or default
  const showFilters = !block.classList.contains('no-filters');
  const postsPerPage = parseInt(block.dataset.postsPerPage) || 10;
  const showLoadMore = !block.classList.contains('no-load-more');
  const autoRefresh = !block.classList.contains('no-auto-refresh');

  const options = {
    showFilters,
    postsPerPage,
    showLoadMore
  };

  let allPosts = [];

  // Function to refresh posts
  const refreshPosts = async () => {
    try {
      const posts = await fetchPosts();
      const blogPosts = filterBlogPosts(posts);
      const sortedPosts = sortPostsByDate(blogPosts);
      
      // Check if posts have changed
      const postsChanged = JSON.stringify(sortedPosts) !== JSON.stringify(allPosts);
      
      if (postsChanged) {
        console.log('Posts updated, refreshing display...');
        allPosts = sortedPosts;
        renderPosts(allPosts, block, options);
        
        // Re-setup event listeners
        setupFiltering(block, allPosts);
        setupLoadMore(block, allPosts);
      }
    } catch (error) {
      console.error('Error refreshing posts:', error);
      block.innerHTML = `
        <div class="blog-error">
          <p>Error loading posts. Please try again later.</p>
        </div>
      `;
    }
  };

  // Initial load
  await refreshPosts();

  // Setup auto-refresh if enabled
  if (autoRefresh) {
    setupAutoRefresh(block, refreshPosts);
  }

  console.log(`Dynamic blog loaded with ${allPosts.length} posts`);
}