/**
 * Block options are applied as classes to the block's DOM element
 * alongside the `block` and `quote` classes.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
function getOptions(block) {
  // Get the block's classes, excluding 'block' and 'quote'.
  return [...block.classList].filter((c) => !['block', 'quote'].includes(c));
}

/**
 * Entry point to the block's JavaScript.
 * Must be exported as default and accept a block's DOM element.
 * This function is called by the project's scripts.js, passing the block's element.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
export default function decorate(block) {
  const [quoteWrapper] = block.children;
  const [quote, author] = quoteWrapper.children;

  // Create blockquote element
  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
  
  // Create a div for the author
  const authorDiv = document.createElement('div');
  
  // Check if author element exists and has content
  if (author && author.textContent.trim()) {
    // Find paragraph in author div if it exists
    const authorParagraph = author.querySelector('p');
    
    // If paragraph exists, use its content, otherwise use the author element's content
    const authorText = authorParagraph ? authorParagraph.textContent : author.textContent.trim();
    
    // Set the author div content
    authorDiv.textContent = authorText;
    
    // Add the author class to the div
    authorDiv.classList.add('author');
    
    // Create a container for the author
    const authorContainer = document.createElement('div');
    authorContainer.appendChild(authorDiv);
    
    // Add the author container after the blockquote
    quoteWrapper.appendChild(authorContainer);
  }

  // Handle block options - the classes are automatically applied by AEM
  // No additional JavaScript logic needed for styling, but we can add conditional logic here if needed
  const options = getOptions(block);
  
  // Example: Add conditional logic based on block options
  if (options.includes('dark')) {
    // Additional dark theme specific JavaScript logic can be added here
    console.log('Dark theme quote block initialized');
  } else if (options.includes('highlight')) {
    // Additional highlight theme specific JavaScript logic can be added here
    console.log('Highlight theme quote block initialized');
  } else if (options.includes('light')) {
    // Additional light theme specific JavaScript logic can be added here
    console.log('Light theme quote block initialized');
  } else {
    // Default theme
    console.log('Default theme quote block initialized');
  }
}
