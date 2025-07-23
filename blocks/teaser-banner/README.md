# Teaser Banner

A full-width banner component that displays background media (image or video) with overlaid content positioned in the bottom left corner. Perfect for hero sections, promotional banners, and call-to-action areas.

## Features

- **Full-bleed width**: Extends to screen edges for maximum visual impact
- **Fixed height**: 600px on desktop, 500px on mobile for consistent layout
- **Media support**: Supports both images and videos as background media
- **Responsive design**: Mobile-first approach with multiple breakpoints
- **Accessibility**: Includes focus states, high contrast support, and reduced motion preferences
- **Universal Editor compatible**: Works seamlessly with AEM Universal Editor

## Usage

To use the Teaser Banner block, create a table in your document with "Teaser Banner" in the first cell:

`| Teaser Banner |`
`|---|`
`| ![Background Image](./media/banner-image.jpg) |`
`| ## Your Amazing Title |`
`| This is your compelling description that will draw users in. |`
`| [Call to Action](https://example.com) |`

## Authoring

### Structure

The block requires exactly 2 rows:

1. **Media Row**: Contains the background image or video
2. **Content Row**: Contains the title, description, and call-to-action button

### Media Row

The first row should contain your background media:

- **Images**: Upload an image or paste an image URL
- **Videos**: Use a link to your video file (supports .mp4, .webm, .mov formats)
- **Alt text**: Include descriptive alt text for accessibility

### Content Row

The second row contains your text content:

- **Title**: Use heading tags (H1, H2, or H3) for the main title
- **Description**: Use paragraph text for the description
- **Button**: Include a link that will be automatically styled as a button

### Example Content Structure

```
Media: background-video.mp4
Title: Experience Innovation
Description: Discover cutting-edge solutions that transform your business.
Button: Learn More → /solutions
```

## Styling

The Teaser Banner uses CSS variables for consistent theming:

- `--heading-font-family`: Font family for titles
- `--body-font-family`: Font family for descriptions
- `--link-color`: Primary button color
- `--link-hover-color`: Button hover state color
- `--text-color`: Text color for content
- `--dark-color`: Secondary text color

### Content Positioning

- Content is positioned in the bottom left corner
- 2rem spacing from screen edges (responsive)
- Semi-transparent white background with blur effect
- Maximum width constraints for readability

### Responsive Behavior

- **Mobile (< 768px)**: 500px height, full-width content
- **Tablet (768px - 899px)**: Content max-width 400px
- **Desktop (≥ 900px)**: 600px height, content max-width 600px
- **Large Desktop (≥ 1200px)**: Content max-width 700px, increased spacing

## Video Support

The block automatically detects video files and creates proper video elements:

- Autoplay (muted for accessibility)
- Loop playback
- Proper mobile video attributes
- Object-fit cover for consistent sizing

Supported video formats:
- MP4
- WebM
- MOV

## Accessibility Features

- **Focus management**: Proper focus indicators for interactive elements
- **High contrast support**: Enhanced visibility in high contrast mode
- **Reduced motion**: Respects user motion preferences
- **Semantic HTML**: Proper heading hierarchy and link structure
- **Alt text**: Image descriptions for screen readers

## Performance Optimization

- **Optimized images**: Automatic image optimization with multiple sizes
- **Lazy loading**: Images load efficiently based on viewport
- **CSS containment**: Isolated styles prevent conflicts
- **Modern video attributes**: Efficient video loading and playback

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari (with -webkit-backdrop-filter support)
- Progressive enhancement for older browsers

## Component Group

This component belongs to the "{site.name} - Content" group in AEM Universal Editor.

## Examples

### Image Banner
```
| Teaser Banner |
|---|
| ![Hero Image](./media/hero.jpg) |
| ## Welcome to Our Platform |
| Transform your workflow with our innovative solutions. |
| [Get Started](https://example.com/signup) |
```

### Video Banner
```
| Teaser Banner |
|---|
| [Demo Video](./media/demo.mp4) |
| ## See It In Action |
| Watch how our platform revolutionizes productivity. |
| [Watch Demo](https://example.com/demo) |
```

## Technical Notes

- Uses modern CSS Grid and Flexbox for layout
- Implements proper z-index stacking for media and content layers
- Includes backdrop-filter with Safari fallback
- Mobile-first responsive design approach
- Follows EDS naming conventions and best practices 