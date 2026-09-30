export function renderDynamicContent(langData) {
  const page = document.body.dataset.page;
  
  if (page === 'projects' && langData.projects && langData.projects.items) {
    renderGrid('projects', langData.projects.items);
  } else if (page === 'passions' && langData.passions && langData.passions.items) {
    renderGrid('passions', langData.passions.items);
  } else if (page === 'civic' && langData.civic && langData.civic.items) {
    renderGrid('civic', langData.civic.items);
  } else if (page === 'career' && langData.career && langData.career.jobs && langData.career.jobs.items) {
    renderCareerList(langData.career.jobs.items);
  }
}

function renderGrid(sectionName, items) {
  const grid = document.querySelector('.grid-2, .grid-3');
  if (!grid) return;
  grid.innerHTML = ''; // Clear hardcoded
  
  items.forEach((item, index) => {
    // 1. Create Card
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.status = item.status || 'past';
    li.dataset.modal = `${sectionName}_item_${index}`;
    li.tabIndex = 0;
    li.style.cursor = 'pointer';
    
    // Icon (01, 02...)
    const icon = document.createElement('span');
    icon.className = 'card__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = String(index + 1).padStart(2, '0');
    li.appendChild(icon);
    
    // Title
    const title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = item.title || item.name || '';
    li.appendChild(title);
    
    // Desc
    const desc = document.createElement('p');
    desc.className = 'card__body';
    desc.textContent = item.desc || item.role || '';
    li.appendChild(desc);
    
    // Tags
    if (item.tags && item.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'card__tags';
      item.tags.forEach(t => {
        const encTag = encodeURIComponent(t);
        const a = document.createElement('a');
        a.href = `./tag.html?tag=${encTag}`;
        a.className = 'badge nav-link';
        a.textContent = t;
        a.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        tagsDiv.appendChild(a);
      });
      li.appendChild(tagsDiv);
    }
    
    grid.appendChild(li);
  });
}

function renderCareerList(items) {
  const list = document.querySelector('.career-list');
  if (!list) return;
  list.innerHTML = '';
  
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'career-item';
    li.dataset.modal = `career_item_${index}`;
    li.tabIndex = 0;
    li.style.cursor = 'pointer';
    
    const num = document.createElement('div');
    num.className = 'career-item__num';
    num.textContent = String(index + 1).padStart(2, '0');
    li.appendChild(num);
    
    const content = document.createElement('div');
    content.className = 'career-item__content';
    
    const title = document.createElement('h3');
    title.className = 'career-item__title';
    title.textContent = item.title || '';
    content.appendChild(title);
    
    const meta = document.createElement('div');
    meta.className = 'career-item__meta';
    meta.textContent = item.meta || '';
    content.appendChild(meta);
    
    const desc = document.createElement('p');
    desc.className = 'career-item__desc';
    desc.textContent = item.desc || '';
    content.appendChild(desc);
    
    if (item.tags && item.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'card__tags';
      item.tags.forEach(t => {
        const encTag = encodeURIComponent(t);
        const a = document.createElement('a');
        a.href = `./tag.html?tag=${encTag}`;
        a.className = 'badge nav-link';
        a.textContent = t;
        a.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        tagsDiv.appendChild(a);
      });
      content.appendChild(tagsDiv);
    }
    
    li.appendChild(content);
    list.appendChild(li);
  });
}
