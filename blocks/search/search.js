/**
 * Search block that demonstrates query indexing usage
 */

/**
 * Fetches the query index data
 * @param {string} indexUrl - The URL to the query index
 * @returns {Promise<Array>} Array of indexed content
 */
async function fetchQueryIndex(indexUrl = '/query-index.json') {
  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching query index:', error);
    return [];
  }
}

/**
 * Performs search on the indexed content
 * @param {Array} indexData - The indexed content array
 * @param {string} query - The search query
 * @returns {Array} Filtered results
 */
function performSearch(indexData, query) {
  if (!query || query.trim() === '') {
    return indexData;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return indexData.filter(item => {
    // Search in title, description, topics, category, and tags
    const searchableFields = [
      item.title,
      item.description,
      item.topics,
      item.category,
      item.tags
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableFields.includes(searchTerm);
  });
}

/**
 * Renders search results
 * @param {Array} results - Search results array
 * @param {HTMLElement} container - Container element for results
 */
function renderSearchResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = '<p class="no-results">No results found.</p>';
    return;
  }

  const resultsList = results.map(item => `
    <div class="search-result">
      <h3><a href="${item.path}">${item.title || 'Untitled'}</a></h3>
      <p class="description">${item.description || ''}</p>
      <div class="metadata">
        ${item.category ? `<span class="category">${item.category}</span>` : ''}
        ${item.topics ? `<span class="topics">${item.topics}</span>` : ''}
        ${item.lastModified ? `<span class="date">${new Date(item.lastModified * 1000).toLocaleDateString()}</span>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="search-results-count">
      Found ${results.length} result${results.length !== 1 ? 's' : ''}
    </div>
    <div class="search-results">
      ${resultsList}
    </div>
  `;
}

/**
 * Initializes the search functionality
 * @param {HTMLElement} block - The search block element
 */
export default async function decorate(block) {
  // Create search interface
  block.innerHTML = `
    <div class="search-container">
      <div class="search-input-container">
        <input type="text" class="search-input" placeholder="Search content..." />
        <button class="search-button">Search</button>
      </div>
      <div class="search-results-container">
        <p class="search-info">Enter a search term to find content.</p>
      </div>
    </div>
  `;

  const searchInput = block.querySelector('.search-input');
  const searchButton = block.querySelector('.search-button');
  const resultsContainer = block.querySelector('.search-results-container');

  // Fetch the query index
  const indexData = await fetchQueryIndex();
  console.log('Loaded query index:', indexData.length, 'items');

  // Search function
  const performSearchAction = () => {
    const query = searchInput.value;
    const results = performSearch(indexData, query);
    renderSearchResults(results, resultsContainer);
  };

  // Event listeners
  searchButton.addEventListener('click', performSearchAction);
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearchAction();
    }
  });

  // Optional: Real-time search as user types (with debouncing)
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchInput.value.length >= 2) {
        performSearchAction();
      } else if (searchInput.value.length === 0) {
        resultsContainer.innerHTML = '<p class="search-info">Enter a search term to find content.</p>';
      }
    }, 300);
  });
}