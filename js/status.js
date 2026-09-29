async function loadStatus() {
  // 1. JSON Freshness
  try {
    const res = await fetch('./data/translations.json');
    const data = await res.json();
    
    let totalItems = 0;
    let upToDateItems = 0;
    const outdated = [];

    function traverse(node, path) {
      if (typeof node !== 'object' || node === null) return;
      if (node.hasOwnProperty('up_to_date')) {
        totalItems++;
        if (node.up_to_date) {
          upToDateItems++;
        } else {
          const name = node.title || node.name || node.city || path;
          outdated.push(name);
        }
      }
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'object') {
          traverse(v, path ? `${path}.${k}` : k);
        }
      }
    }
    
    traverse(data.en, ''); // Just check english tree

    const jsonProgress = totalItems === 0 ? 0 : Math.round((upToDateItems / totalItems) * 100);
    const bar = document.getElementById('json-progress');
    bar.style.width = `${jsonProgress}%`;
    bar.textContent = `${jsonProgress}%`;

    const list = document.getElementById('outdated-list');
    if (outdated.length === 0) {
      list.innerHTML = '<li><span class="status-badge badge-green">OK</span> All items up to date!</li>';
    } else {
      outdated.forEach(item => {
        list.innerHTML += `<li><span class="status-badge badge-red">TODO</span> ${item}</li>`;
      });
    }
  } catch (e) {
    console.error("Failed to load JSON freshness", e);
  }

  // 2. Constraints Checklist
  try {
    const res = await fetch('./data/constraints.json');
    const data = await res.json();
    const constraints = data.constraints;

    let checkedCount = 0;
    const list = document.getElementById('constraints-list');
    
    constraints.forEach(c => {
      if (c.checked) checkedCount++;
      list.innerHTML += `
        <li>
          <input type="checkbox" class="constraint-checkbox" ${c.checked ? 'checked' : ''} disabled />
          ${c.text}
        </li>
      `;
    });

    const cProgress = constraints.length === 0 ? 0 : Math.round((checkedCount / constraints.length) * 100);
    const cBar = document.getElementById('constraints-progress');
    cBar.style.width = `${cProgress}%`;
    cBar.textContent = `${cProgress}%`;

  } catch (e) {
    console.error("Failed to load constraints", e);
  }
}

document.addEventListener('DOMContentLoaded', loadStatus);
