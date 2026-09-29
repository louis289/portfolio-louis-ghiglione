let editorData = null;

export async function initEditor() {
  document.getElementById('btn-load-current').addEventListener('click', async () => {
    try {
      const res = await fetch('./data/translations.json');
      editorData = await res.json();
      renderEditor();
    } catch(e) {
      alert("Failed to load current translations.json");
    }
  });

  document.getElementById('file-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        editorData = JSON.parse(ev.target.result);
        renderEditor();
      } catch(err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-download').addEventListener('click', () => {
    if (!editorData) return alert("Nothing to download.");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editorData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "translations.json");
    dlAnchorElem.click();
    dlAnchorElem.remove();
  });

  const helpModal = document.getElementById('help-modal');
  document.getElementById('btn-help').addEventListener('click', () => helpModal.classList.add('active'));
  document.getElementById('help-close').addEventListener('click', () => helpModal.classList.remove('active'));
}

function renderEditor() {
  const container = document.getElementById('editor-container');
  container.innerHTML = '';
  
  if (!editorData) return;
  
  const rootNode = createObjectNode(editorData, 'Root');
  container.appendChild(rootNode);
}

function createObjectNode(obj, label) {
  const fieldset = document.createElement('fieldset');
  fieldset.style.cssText = 'border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: 4px;';
  
  const legend = document.createElement('legend');
  legend.textContent = label;
  legend.style.cssText = 'padding: 0 0.5rem; font-weight: bold; color: var(--color-accent2); text-transform: capitalize;';
  fieldset.appendChild(legend);

  if (Array.isArray(obj)) {
    // Array handling
    const listContainer = document.createElement('div');
    obj.forEach((item, index) => {
      const itemNode = createNode(item, `Item ${index + 1}`, (newVal) => { obj[index] = newVal; });
      listContainer.appendChild(itemNode);
    });
    
    // Add Item button
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Add Item';
      addBtn.className = 'settings-btn';
      addBtn.style.marginTop = '0.5rem';
      addBtn.onclick = () => {
        // Clone schema from first item, emptying strings
        const newItem = JSON.parse(JSON.stringify(obj[0]));
        function emptyStrings(node) {
          if (Array.isArray(node)) {
            node.length = 0; // empty arrays by default
          } else if (typeof node === 'object' && node !== null) {
            for (let k in node) {
              if (typeof node[k] === 'string') node[k] = '';
              else if (typeof node[k] === 'boolean') node[k] = false;
              else emptyStrings(node[k]);
            }
          }
        }
        emptyStrings(newItem);
        if (newItem.hasOwnProperty('up_to_date')) newItem.up_to_date = false;
        obj.push(newItem);
        renderEditor(); // full re-render is simplest
      };
      listContainer.appendChild(addBtn);
    }
    fieldset.appendChild(listContainer);
  } else {
    // Object handling
    for (const [key, val] of Object.entries(obj)) {
      const itemNode = createNode(val, key, (newVal) => { obj[key] = newVal; });
      fieldset.appendChild(itemNode);
    }
  }
  
  return fieldset;
}

function createNode(val, key, updateCallback) {
  const wrap = document.createElement('div');
  wrap.style.marginBottom = '0.5rem';

  if (typeof val === 'object' && val !== null) {
    return createObjectNode(val, key);
  }

  const label = document.createElement('label');
  label.textContent = key + ': ';
  label.style.display = 'block';
  label.style.marginBottom = '0.2rem';
  label.style.color = 'var(--color-muted)';
  label.style.fontSize = '0.9rem';
  
  let input;
  
  if (typeof val === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = val;
    input.onchange = (e) => {
      updateCallback(e.target.checked);
      if (key === 'up_to_date') renderEditor();
    };
    // Special styling for up_to_date
    if (key === 'up_to_date') {
      wrap.style.padding = '0.5rem';
      wrap.style.background = val ? 'rgba(74, 255, 74, 0.1)' : 'rgba(255, 74, 74, 0.1)';
      wrap.style.borderRadius = '4px';
      label.style.display = 'inline';
      input.style.marginLeft = '10px';
      input.style.transform = 'scale(1.2)';
    }
  } else {
    // String or number
    const isLong = String(val).length > 60 || key.includes('desc') || key.includes('text');
    if (isLong) {
      input = document.createElement('textarea');
      input.rows = 3;
      input.style.cssText = 'width: 100%; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); padding: 0.5rem; border-radius: 4px;';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.style.cssText = 'width: 100%; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); padding: 0.5rem; border-radius: 4px;';
    }
    input.value = val;
    input.oninput = (e) => updateCallback(e.target.value);
  }

  if (key !== 'up_to_date') {
    wrap.appendChild(label);
  } else {
    wrap.appendChild(input);
    wrap.appendChild(label);
    return wrap; // return early to avoid appending input twice
  }
  
  wrap.appendChild(input);
  return wrap;
}

document.addEventListener('DOMContentLoaded', initEditor);
