# Search Demo - Query Indexing in Action

This page demonstrates the query indexing functionality implemented in Edge Delivery Services.

## How It Works

The search functionality uses the query index created by the `helix-query.yaml` configuration. The index contains metadata from all pages on the site, making them searchable.

## Try the Search

Use the search box below to find content across the site:

---

## Search

Try searching for terms like:
- "tutorial" 
- "Edge Delivery Services"
- "indexing"
- "sample"

---

## About the Implementation

This search implementation:

1. **Fetches the Query Index**: Loads `/query-index.json` which contains indexed content
2. **Performs Client-Side Search**: Searches through titles, descriptions, topics, categories, and tags
3. **Displays Results**: Shows matching content with metadata and links

## Index Configuration

The search uses two indices:

- **Default Index** (`/query-index.json`): Indexes all site content except technical files
- **Articles Index** (`/article-index.json`): Specifically indexes articles with additional metadata

## Next Steps

To extend this implementation:

1. Add more sophisticated search algorithms (fuzzy matching, ranking)
2. Implement server-side search for better performance
3. Add filters by category, date, or author
4. Include full-text search within content body