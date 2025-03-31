export default function decoration(block) {
  const [quoteWrapper] = block.children;
  const [quote, author] = quoteWrapper.children;

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteWrapper.textContent.trim();
  quoteWrapper.replaceChildren(blockquote);
}
