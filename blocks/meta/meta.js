/**
 * Meta block - Displays multiple groups of links
 * @param {Element} block The meta block element
 */
export default function decorate(block) {
  // Get all rows from the block
  const rows = Array.from(block.children);
  
  // Clear the block content
  block.innerHTML = '';
  
  // Create container for all groups
  const groupsContainer = document.createElement('div');
  groupsContainer.className = 'meta-groups';
  
  let currentGroup = null;
  let currentGroupTitle = '';
  
  // Process each row
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    
    if (cells.length >= 2) {
      const firstCell = cells[0];
      const secondCell = cells[1];
      
      // Check if this is a group title (first cell has content, second cell is empty or has group indicator)
      const firstCellText = firstCell.textContent.trim();
      const secondCellText = secondCell.textContent.trim();
      
      // If second cell is empty or contains group-related keywords, treat first cell as group title
      if (!secondCellText || secondCellText.toLowerCase().includes('group')) {
        // Create new group
        currentGroup = document.createElement('div');
        currentGroup.className = 'meta-group';
        
        if (firstCellText) {
          const groupTitle = document.createElement('h3');
          groupTitle.className = 'meta-group-title';
          groupTitle.textContent = firstCellText;
          currentGroup.appendChild(groupTitle);
          currentGroupTitle = firstCellText;
        }
        
        const linksList = document.createElement('ul');
        linksList.className = 'meta-links';
        currentGroup.appendChild(linksList);
        
        groupsContainer.appendChild(currentGroup);
      } else {
        // This is a link row
        if (!currentGroup) {
          // Create default group if none exists
          currentGroup = document.createElement('div');
          currentGroup.className = 'meta-group';
          
          const linksList = document.createElement('ul');
          linksList.className = 'meta-links';
          currentGroup.appendChild(linksList);
          
          groupsContainer.appendChild(currentGroup);
        }
        
        // Extract link and text
        const linkElement = firstCell.querySelector('a');
        const linkText = secondCellText || (linkElement ? linkElement.textContent : firstCellText);
        const linkUrl = linkElement ? linkElement.href : firstCellText;
        
        if (linkUrl && linkText) {
          const linksList = currentGroup.querySelector('.meta-links');
          const listItem = document.createElement('li');
          listItem.className = 'meta-link-item';
          
          const link = document.createElement('a');
          link.href = linkUrl;
          link.textContent = linkText;
          link.className = 'meta-link';
          
          // Add external link indicator if needed
          if (linkUrl.startsWith('http') && !linkUrl.includes(window.location.hostname)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `${linkText} (opens in new tab)`);
          }
          
          listItem.appendChild(link);
          linksList.appendChild(listItem);
        }
      }
    }
  });
  
  // Add the groups container to the block
  block.appendChild(groupsContainer);
  
  // Add ARIA labels for accessibility
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', 'Meta navigation links');
  
  // Add group navigation if multiple groups exist
  const groups = block.querySelectorAll('.meta-group');
  if (groups.length > 1) {
    groups.forEach((group, index) => {
      const title = group.querySelector('.meta-group-title');
      if (title) {
        title.id = `meta-group-${index}`;
        const linksList = group.querySelector('.meta-links');
        if (linksList) {
          linksList.setAttribute('aria-labelledby', `meta-group-${index}`);
        }
      }
    });
  }
}
