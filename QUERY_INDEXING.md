# Query Indexing Implementation

This document explains the query indexing implementation following Mayur Satav's guide for Edge Delivery Services.

## Overview

Query indexing in Edge Delivery Services (EDS) improves content searchability, enabling users to quickly find relevant information. This implementation provides both site-wide and targeted content indexing.

## Configuration Files

### helix-query.yaml

The main configuration file that defines how content is indexed:

#### Default Index
- **Target**: `/query-index.json`
- **Includes**: All site content (`/**`)
- **Excludes**: Technical directories and files (configuration, blocks, scripts, styles, etc.)
- **Properties**: Title, description, image, topics, category, template, lastModified, robots

#### Articles Index
- **Target**: `/article-index.json`
- **Includes**: `/articles/**`, `/blog/**`, `/news/**`
- **Excludes**: Draft content
- **Properties**: All default properties plus authors, readingTime, articlePublishDate, type, tags

### paths.json

Maps the index endpoints to make them accessible:

```json
{
  "mappings": [
    "/content/ue-eds-demo.resource/query-index.json:/query-index.json",
    "/content/ue-eds-demo.resource/article-index.json:/article-index.json"
  ]
}
```

## Implementation Details

### Metadata Extraction

The indexing system extracts metadata from HTML meta tags:

- `og:title` → title
- `meta[name="description"]` → description  
- `og:image` → image
- `meta[name="topics"]` → topics
- `meta[name="category"]` → category
- `meta[name="authors"]` → authors
- `meta[name="publishdate"]` → articlePublishDate
- `meta[name="readingtime"]` → readingTime
- `meta[name="template"]` → template/type
- `meta[name="tags"]` → tags

### Search Block

A custom search block (`/blocks/search/`) demonstrates how to use the query index:

#### Features:
- Real-time search with debouncing
- Searches across title, description, topics, category, and tags
- Displays results with metadata
- Responsive design

#### Usage:
Add a "Search" block to any page to enable search functionality.

## Sample Content

### Sample Article
- Location: `/articles/sample-article.md`
- Metadata: Defined in corresponding JSON file
- Demonstrates proper metadata structure for indexing

### Search Demo Page
- Location: `/search-demo.md`
- Shows the search block in action
- Provides usage instructions

## Testing the Implementation

1. **View Index Data**: Visit `/query-index.json` to see indexed content
2. **View Articles Index**: Visit `/article-index.json` to see article-specific index
3. **Test Search**: Use the search demo page to test search functionality

## Benefits

1. **Improved Searchability**: Content is easily discoverable
2. **Flexible Configuration**: Different indices for different content types
3. **Rich Metadata**: Comprehensive metadata extraction for better search results
4. **Performance**: Client-side search for fast results

## Extension Possibilities

1. **Server-Side Search**: For better performance with large datasets
2. **Advanced Search**: Filters, sorting, faceted search
3. **Full-Text Search**: Include content body in search
4. **Search Analytics**: Track search queries and results
5. **Auto-Complete**: Suggest search terms as users type

## Document-Based Authoring Alternative

For document-based authoring (Google Docs, Word), the same configuration can be implemented in `query-index.xlsx` instead of `helix-query.yaml`.

## References

- [Mayur Satav's Medium Article](https://medium.com/@mayursatav/query-indexing-in-edge-delivery-services-393f84d71bfe)
- [Edge Delivery Services Documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/edge-delivery/overview.html)