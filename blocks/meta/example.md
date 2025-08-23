# Meta Block Example

This example demonstrates how to use the meta block with multiple links.

## Usage in Universal Editor

The meta block now supports multiple links with custom text. Each link consists of:

- A link URL (from first column)
- Custom link text/label (from second column)

## Block Structure

When using the meta block in your content, structure it as follows:

```
| [Link URL 1](https://example.com) | Link Text 1 |
| [Link URL 2](https://example.com) | Link Text 2 |
| [Link URL 3](https://example.com) | Link Text 3 |
| [Link URL 4](https://example.com) | Link Text 4 |
```

Or with plain URLs:

```
| https://example.com/page1 | Link Text 1 |
| https://example.com/page2 | Link Text 2 |
| /internal-page | Internal Link |
```

## Features

- **Multiple Links**: Add as many links as needed
- **Custom Link Text**: Each link can have custom display text
- **Flexible URLs**: Support for both internal and external links
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive Design**: Works on all screen sizes
- **External Link Indicators**: Visual indicators for external links

## Styling

The block includes:

- Clean vertical list layout
- Hover and focus states
- Dark mode support
- High contrast mode support
- Reduced motion support
