# Dynamic Blog - All Posts

This page demonstrates the dynamic blog component that automatically fetches and displays posts from the blog, articles, and news directories.

## Features

- **Automatic Updates**: Content updates automatically when new posts are published
- **Smart Filtering**: Filter posts by category (Blog, Articles, News)
- **Responsive Design**: Optimized for all device sizes
- **Rich Metadata**: Displays publication date, reading time, authors, and topics
- **Load More**: Pagination for better performance
- **Real-time Refresh**: Checks for updates every 5 minutes

## All Posts

---

## Dynamic Blog

---

## How It Works

The dynamic blog component:

1. **Fetches from Query Index**: Uses the `/query-index.json` endpoint
2. **Filters Content**: Shows only posts from `/blog/`, `/articles/`, and `/news/` directories
3. **Extracts Metadata**: Pulls title, description, publish date, authors, topics, and more from HTML meta tags
4. **Auto-Updates**: Refreshes content when new posts are published
5. **Provides Filtering**: Allows users to filter by content type

## Content Structure

Posts should include proper metadata in HTML head tags:

```html
<meta name="description" content="Post description">
<meta property="og:title" content="Post Title">
<meta name="authors" content="Author Name">
<meta name="publishdate" content="2025-01-15">
<meta name="readingtime" content="5 min">
<meta name="category" content="Tutorial">
<meta name="topics" content="Topic1, Topic2">
<meta name="tags" content="tag1, tag2, tag3">
```

## Customization Options

The component supports various configuration options:

- `no-filters`: Disable category filtering
- `no-load-more`: Show all posts at once
- `no-auto-refresh`: Disable automatic updates
- `data-posts-per-page="20"`: Change posts per page

Example usage:
```markdown
## Dynamic Blog (no-filters, data-posts-per-page="20")
```