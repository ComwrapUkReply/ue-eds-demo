# Dynamic Blog Block

A sophisticated blog component that automatically fetches and displays posts from blog, articles, and news directories with real-time updates.

## Features

- **🔄 Automatic Updates**: Content refreshes automatically when new posts are published
- **📂 Multi-Directory Support**: Fetches from `/blog/`, `/articles/`, and `/news/` directories
- **🏷️ Smart Filtering**: Filter posts by category with dynamic filter buttons
- **📱 Responsive Design**: Optimized for all device sizes
- **📊 Rich Metadata**: Displays publication date, reading time, authors, topics, and tags
- **⚡ Performance Optimized**: Lazy loading and pagination for better performance
- **🔍 SEO Friendly**: Proper semantic markup and metadata extraction

## Usage

### Basic Usage

Add a "Dynamic Blog" section to any Markdown page:

```markdown
## Dynamic Blog
```

### With Configuration

```markdown
## Dynamic Blog (no-filters, data-posts-per-page="20")
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `no-filters` | Disable category filtering | `false` |
| `no-load-more` | Show all posts at once | `false` |
| `no-auto-refresh` | Disable automatic updates | `false` |
| `data-posts-per-page` | Posts per page | `10` |

## Content Structure

### Directory Structure

The component automatically fetches posts from:

```
/blog/
  ├── post-1.md
  ├── post-1-head.html
  ├── post-2.md
  └── post-2-head.html
/articles/
  ├── article-1.md
  ├── article-1-head.html
  └── ...
/news/
  ├── news-1.md
  ├── news-1-head.html
  └── ...
```

### Metadata Requirements

Each post should have a corresponding `-head.html` file with proper metadata:

```html
<meta name="description" content="Post description">
<meta property="og:title" content="Post Title">
<meta property="og:description" content="Social media description">
<meta property="og:image" content="/path/to/image.jpg">
<meta property="og:image:alt" content="Image alt text">
<meta name="template" content="blog-post">
<meta name="category" content="Tutorial">
<meta name="topics" content="Topic1, Topic2, Topic3">
<meta name="tags" content="tag1, tag2, tag3">
<meta name="authors" content="Author Name">
<meta name="publishdate" content="2025-01-15">
<meta name="readingtime" content="5 min">
<meta name="robots" content="index, follow">
```

### Required Metadata

| Field | Description | Example |
|-------|-------------|---------|
| `description` | Post description for SEO | "Learn advanced EDS techniques" |
| `og:title` | Social media title | "Advanced EDS Tutorial" |
| `publishdate` | Publication date (ISO format) | "2025-01-15" |
| `category` | Post category | "Tutorial", "News", "Development" |

### Optional Metadata

| Field | Description | Example |
|-------|-------------|---------|
| `topics` | Comma-separated topics | "EDS, Performance, SEO" |
| `tags` | Comma-separated tags | "tutorial, advanced, tips" |
| `authors` | Author name(s) | "John Doe, Jane Smith" |
| `readingtime` | Estimated reading time | "5 min" |
| `og:image` | Social media image | "/images/post-image.jpg" |
| `og:image:alt` | Image alt text | "Tutorial screenshot" |

## Technical Implementation

### Data Flow

1. **Fetch**: Component fetches `/query-index.json`
2. **Filter**: Filters posts from blog/articles/news directories
3. **Sort**: Sorts by publication date (newest first)
4. **Render**: Creates HTML for each post
5. **Update**: Automatically refreshes every 5 minutes

### Performance Features

- **Lazy Loading**: Images load as they come into view
- **Pagination**: Load more posts on demand
- **Caching**: Leverages browser caching for better performance
- **Debouncing**: Optimized filtering and search

### Auto-Update Mechanism

The component automatically checks for updates:

- **Every 5 minutes**: Background refresh
- **On page visibility**: When user returns to tab
- **Smart diffing**: Only updates if content has changed

## Styling

### CSS Custom Properties

The component uses CSS custom properties for theming:

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  /* ... more properties */
}
```

### Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1023px (2 columns)
- **Desktop**: 1024px+ (3 columns)

### Dark Mode Support

The component includes dark mode styles that activate based on user preference:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Features Used**: 
  - Fetch API
  - CSS Grid
  - CSS Custom Properties
  - Intersection Observer (for lazy loading)

## Examples

### Example Post Structure

**File**: `/blog/my-awesome-post.md`
```markdown
# My Awesome Post

This is the content of my blog post...

## Section 1

Content here...
```

**Metadata**: `/blog/my-awesome-post-head.html`
```html
<meta name="description" content="An awesome blog post about EDS">
<meta property="og:title" content="My Awesome Post">
<meta name="authors" content="John Doe">
<meta name="publishdate" content="2025-01-15">
<meta name="readingtime" content="3 min">
<meta name="category" content="Blog">
<meta name="topics" content="EDS, Tutorial">
```

### Example Usage Page

```markdown
# All Blog Posts

Welcome to our blog! Here are all our latest posts:

## Dynamic Blog

Browse through our latest articles, tutorials, and news updates.
```

## Troubleshooting

### Common Issues

1. **Posts not appearing**
   - Check if metadata files exist
   - Verify directory structure (`/blog/`, `/articles/`, `/news/`)
   - Ensure proper metadata format

2. **Filtering not working**
   - Verify `category` metadata is set
   - Check for JavaScript errors in console

3. **Auto-refresh not working**
   - Ensure component doesn't have `no-auto-refresh` class
   - Check browser console for errors

### Debugging

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug-dynamic-blog', 'true');
```

## Contributing

When contributing to this component:

1. Maintain backward compatibility
2. Add appropriate JSDoc comments
3. Update this README with any new features
4. Test across different screen sizes
5. Ensure accessibility standards are met

## License

This component is part of the EDS Demo project and follows the same license terms.