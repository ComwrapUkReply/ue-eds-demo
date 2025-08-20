/**
 * Quick Search - A compact search component
 */

async function fetchQueryIndex() {
  try {
    const response = await fetch('/query-index.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching query index:', error);
    return [];
  }
}

function performSearch(indexData, query) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.toLowerCase().trim();
  return indexData.filter(item => {
    const searchableText = [
      item.title,
      item.description,
      item.topics,
      item.category
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  }).slice(0, 5); // Limit to 5 results for quick search
}

export default async function decorate(block) {
  block.innerHTML = `
    <div class="quick-search">
      <input type="text" placeholder="Quick search..." class="quick-search-input">
      <div class="quick-search-results" style="display: none;"></div>
    </div>
  `;

  const input = block.querySelector('.quick-search-input');
  const results = block.querySelector('.quick-search-results');
  const indexData = await fetchQueryIndex();

  let searchTimeout;
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = input.value;
    
    if (query.length < 2) {
      results.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(() => {
      const searchResults = performSearch(indexData, query);
      
      if (searchResults.length > 0) {
        results.innerHTML = searchResults.map(item => `
          <a href="${item.path}" class="quick-result">
            <div class="result-title">${item.title || 'Untitled'}</div>
            <div class="result-desc">${item.description || ''}</div>
          </a>
        `).join('');
        results.style.display = 'block';
      } else {
        results.innerHTML = '<div class="no-results">No results found</div>';
        results.style.display = 'block';
      }
    }, 200);
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      results.style.display = 'none';
    }
  });
}