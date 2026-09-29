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
  const grid = document.querySelector('.grid-2');
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
        tagsDiv.appendChild(a);
      });
      li.appendChild(tagsDiv);
    }
    
    grid.appendChild(li);
    
    // 2. Create Modal (if article exists)
    if (item.article) {
      createModal(`${sectionName}_item_${index}`, item.article);
    }
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
        tagsDiv.appendChild(a);
      });
      content.appendChild(tagsDiv);
    }
    
    li.appendChild(content);
    list.appendChild(li);
    
    if (item.article) {
      createModal(`career_item_${index}`, item.article);
    }
  });
}

function createModal(id, articleData) {
  // Check if modal container exists
  let modalBackdrop = document.querySelector('.modal-backdrop');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }
  
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.id = id;
  
  const header = document.createElement('div');
  header.className = 'modal__header';
  
  const title = document.createElement('h2');
  title.className = 'modal__title';
  title.textContent = articleData.title || '';
  
  const tag = document.createElement('span');
  tag.className = 'modal__tag';
  tag.textContent = articleData.tag || '';
  
  const btnClose = document.createElement('button');
  btnClose.className = 'modal__close';
  btnClose.setAttribute('aria-label', 'Close dialog');
  btnClose.innerHTML = '&times;';
  
  header.appendChild(title);
  header.appendChild(tag);
  header.appendChild(btnClose);
  
  const body = document.createElement('div');
  body.className = 'modal__body';
  body.innerHTML = articleData.body || '';
  
  dialog.appendChild(header);
  dialog.appendChild(body);
  modalBackdrop.appendChild(dialog);
}
