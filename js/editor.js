let editorData = null;
let currentLangs = [];

export async function initEditor() {
  document.getElementById('btn-load-current').addEventListener('click', async () => {
    try {
      const res = await fetch('./data/translations.json');
      editorData = await res.json();
      currentLangs = Object.keys(editorData);
      renderParallelEditor();
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
        currentLangs = Object.keys(editorData);
        renderParallelEditor();
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
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "translations.json");
    dlAnchorElem.click();
    dlAnchorElem.remove();
  });

  const helpModal = document.getElementById('help-modal');
  document.getElementById('btn-help').addEventListener('click', () => helpModal.classList.add('active'));
  document.getElementById('help-close').addEventListener('click', () => helpModal.classList.remove('active'));
  
  // Add Language Button
  const addLangBtn = document.createElement('button');
  addLangBtn.className = 'settings-btn';
  addLangBtn.textContent = '+ Add Language';
  addLangBtn.style.background = 'var(--color-accent)';
  addLangBtn.style.color = '#fff';
  addLangBtn.onclick = () => {
    if (!editorData) return alert("Load JSON first.");
    const newLang = prompt("Enter new language code (e.g., 'es', 'de'):");
    if (newLang && newLang.length === 2 && !editorData[newLang]) {
      editorData[newLang] = JSON.parse(JSON.stringify(editorData['en'] || editorData[currentLangs[0]]));
      currentLangs.push(newLang);
      renderParallelEditor();
    }
  };
  document.getElementById('editor-controls').appendChild(addLangBtn);
}

function renderParallelEditor() {
  const container = document.getElementById('editor-container');
  container.innerHTML = '';
  if (!editorData || currentLangs.length === 0) return;

  const baseLang = currentLangs[0];
  const rootNode = createParallelObjectNode(editorData[baseLang], 'Root', []);
  container.appendChild(rootNode);
}

// path is an array of keys to reach this object from the language root
function createParallelObjectNode(obj, label, path) {
  const fieldset = document.createElement('fieldset');
  fieldset.style.cssText = 'border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: 4px;';
  
  const legend = document.createElement('legend');
  legend.textContent = label;
  legend.style.cssText = 'padding: 0 0.5rem; font-weight: bold; color: var(--color-accent2); text-transform: capitalize;';
  fieldset.appendChild(legend);

  if (Array.isArray(obj)) {
    const listContainer = document.createElement('div');
    obj.forEach((item, index) => {
      const itemPath = [...path, index];
      const itemNode = createParallelNode(item, `Item ${index + 1}`, itemPath);
      listContainer.appendChild(itemNode);
    });
    
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Add Item';
      addBtn.className = 'settings-btn';
      addBtn.style.marginTop = '0.5rem';
      addBtn.onclick = () => {
        currentLangs.forEach(lang => {
          let targetArr = editorData[lang];
          for (const k of path) targetArr = targetArr[k];
          
          const newItem = JSON.parse(JSON.stringify(targetArr[0]));
          emptyStrings(newItem);
          if (newItem.hasOwnProperty('up_to_date')) newItem.up_to_date = false;
          targetArr.push(newItem);
        });
        renderParallelEditor();
      };
      listContainer.appendChild(addBtn);
    }
    fieldset.appendChild(listContainer);
  } else {
    for (const [key, val] of Object.entries(obj)) {
      const itemNode = createParallelNode(val, key, [...path, key]);
      fieldset.appendChild(itemNode);
    }
  }
  
  return fieldset;
}

function emptyStrings(node) {
  if (Array.isArray(node)) {
    node.length = 0;
  } else if (typeof node === 'object' && node !== null) {
    for (let k in node) {
      if (typeof node[k] === 'string') node[k] = '';
      else if (typeof node[k] === 'boolean') node[k] = false;
      else emptyStrings(node[k]);
    }
  }
}

function createParallelNode(val, key, path) {
  if (typeof val === 'object' && val !== null) {
    return createParallelObjectNode(val, key, path);
  }

  const row = document.createElement('div');
  row.style.marginBottom = '1rem';
  
  const label = document.createElement('div');
  label.textContent = key;
  label.style.fontWeight = 'bold';
  label.style.marginBottom = '0.5rem';
  label.style.color = 'var(--color-muted)';
  row.appendChild(label);

  const colsContainer = document.createElement('div');
  colsContainer.style.display = 'flex';
  colsContainer.style.gap = '1rem';
  
  currentLangs.forEach(lang => {
    let parentObj = editorData[lang];
    for (let i = 0; i < path.length - 1; i++) {
      if (!parentObj[path[i]]) parentObj[path[i]] = {}; // fallback sync
      parentObj = parentObj[path[i]];
    }
    const finalKey = path[path.length - 1];
    
    const col = document.createElement('div');
    col.style.flex = '1';
    
    const langLabel = document.createElement('div');
    langLabel.textContent = lang.toUpperCase();
    langLabel.style.fontSize = '0.8rem';
    langLabel.style.marginBottom = '0.2rem';
    col.appendChild(langLabel);

    const updateCallback = (newVal) => {
      parentObj[finalKey] = newVal;
      if (key === 'up_to_date') renderParallelEditor();
    };

    if (typeof val === 'boolean') {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = parentObj[finalKey];
      input.onchange = (e) => updateCallback(e.target.checked);
      col.appendChild(input);
      
      if (key === 'up_to_date') {
        col.style.background = parentObj[finalKey] ? 'rgba(74, 255, 74, 0.1)' : 'rgba(255, 74, 74, 0.1)';
        col.style.padding = '0.5rem';
        col.style.borderRadius = '4px';
        input.style.transform = 'scale(1.2)';
      }
    } else {
      const isLong = String(val).length > 60 || key.includes('desc') || key.includes('text');
      
      if (isLong) {
        // Rich Text (contenteditable)
        const toolbar = document.createElement('div');
        toolbar.innerHTML = `
          <button type="button" onclick="document.execCommand('bold',false,null)" style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);cursor:pointer;padding:2px 5px;"><b>B</b></button>
          <button type="button" onclick="document.execCommand('italic',false,null)" style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);cursor:pointer;padding:2px 5px;"><i>I</i></button>
          <button type="button" onclick="const url=prompt('URL:'); if(url) document.execCommand('createLink',false,url);" style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);cursor:pointer;padding:2px 5px;">Link</button>
          <button type="button" onclick="document.execCommand('insertUnorderedList',false,null)" style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);cursor:pointer;padding:2px 5px;">List</button>
        `;
        toolbar.style.marginBottom = '2px';
        
        const input = document.createElement('div');
        input.contentEditable = "true";
        input.innerHTML = parentObj[finalKey] || '';
        input.style.cssText = 'width: 100%; min-height: 80px; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); padding: 0.5rem; border-radius: 4px; font-family: inherit; line-height: 1.5; overflow-y: auto;';
        input.oninput = (e) => updateCallback(e.target.innerHTML);
        
        // Mode switch
        const switchBtn = document.createElement('button');
        switchBtn.textContent = 'Toggle HTML';
        switchBtn.style.cssText = 'font-size:0.7rem; margin-left:10px; background:transparent; color:var(--color-accent); border:none; cursor:pointer; text-decoration:underline;';
        let isRaw = false;
        switchBtn.onclick = () => {
          isRaw = !isRaw;
          if (isRaw) {
            input.contentEditable = "false";
            const textarea = document.createElement('textarea');
            textarea.style.cssText = input.style.cssText;
            textarea.value = parentObj[finalKey] || '';
            textarea.oninput = (e) => { updateCallback(e.target.value); input.innerHTML = e.target.value; };
            col.replaceChild(textarea, input);
            input = textarea;
          } else {
            const div = document.createElement('div');
            div.contentEditable = "true";
            div.style.cssText = input.style.cssText;
            div.innerHTML = parentObj[finalKey] || '';
            div.oninput = (e) => updateCallback(e.target.innerHTML);
            col.replaceChild(div, input);
            input = div;
          }
        };
        toolbar.appendChild(switchBtn);
        
        col.appendChild(toolbar);
        col.appendChild(input);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = parentObj[finalKey] || '';
        input.style.cssText = 'width: 100%; background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); padding: 0.5rem; border-radius: 4px;';
        input.oninput = (e) => updateCallback(e.target.value);
        col.appendChild(input);
      }
    }
    colsContainer.appendChild(col);
  });
  
  row.appendChild(colsContainer);
  return row;
}

document.addEventListener('DOMContentLoaded', initEditor);
