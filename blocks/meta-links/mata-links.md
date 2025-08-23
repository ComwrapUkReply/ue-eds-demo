# Meta Links Block Example

This example demonstrates how to use the meta-links block to display multiple links, each with URL, text, and optional description.

## Usage in Universal Editor

The meta-links block is a **container block** that allows authors to add multiple link entries. Each link entry has three configurable fields:
- **Link URL** - The destination URL
- **Link Text** - The display text for the link  
- **Link Description** - Optional additional description text

## Universal Editor Workflow

1. **Add Meta Links Block** - Add the "Meta Links" block to your section
2. **Add Link Entries** - Click the "+" button to add "Meta Link" items inside the block
3. **Configure Each Link** - For each Meta Link item, configure:
   - **Link URL** - Select or enter the destination URL
   - **Link Text** - Enter the text that users will click on
   - **Link Description** - Enter optional descriptive text
4. **Add More Links** - Keep adding Meta Link items as needed

## Block Structure

The meta-links block follows the container/item pattern:
- **Meta Links** (container) - Can contain multiple Meta Link items
- **Meta Link** (item) - Individual link with URL, text, and description

## Features

- **Multiple Link Entries**: Add as many links as needed within one block
- **Individual Configuration**: Each link has its own URL, text, and description
- **Card-based Layout**: Each link appears in its own styled card
- **External Link Detection**: Automatically adds indicators for external links
- **Accessibility**: Proper ARIA labels, semantic HTML, and keyboard navigation
- **Responsive Design**: Works on all screen sizes with mobile-optimized layout
- **Universal Editor Integration**: Full support for adding/removing/reordering links

## Example Output

When configured with multiple links, the block will render like this:

┌─────────────────────────────────┐
│ **Home Page** ↗                 │
│ *Visit our main homepage*       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ **About Us**                    │
│ *Learn more about our company*  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ **Contact**                     │
│ *Get in touch with our team*    │
└─────────────────────────────────┘

## Styling

The block includes:
- Card-based layout with individual link containers
- Hover effects and focus states for each card
- External link indicators (↗ symbol)
- Descriptive text styling below each link
- Dark mode support
- High contrast mode support
- Reduced motion support
- Print-friendly styles
