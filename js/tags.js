import { propagateUrlParams } from './nav.js';

async function initTagPage() {
  const container = document.getElementById('tag-content-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const currentTag = urlParams.get('tag');
  
  if (!currentTag) {
    container.innerHTML = '<h2 style="text-align: center;">No tag specified.</h2>';
    return;
  }

  try {
    const res = await fetch('./data/translations.json');
    const data = await res.json();
    const lang = urlParams.get('lang') || 'en';
    const langData = data[lang] || data['en'];

    // Collect all items across the portfolio
    const allItems = [];
    const sectionsToSearch = ['projects', 'passions', 'civic', 'career'];
    
    // We recursively extract items that have a 'tags' array
    function extractItems(node, sectionName, titlePrefix = '') {
      if (typeof node !== 'object' || node === null) return;
      if (Array.isArray(node.tags)) {
        const titleKey = Object.keys(node).find(k => k.endsWith('_title') || k.endsWith('name') || k === 'title');
        const descKey = Object.keys(node).find(k => k.endsWith('_desc') || k.endsWith('role') || k === 'description' || k === 'text');
        
        allItems.push({
          title: node[titleKey] || titlePrefix || 'Unnamed Item',
          desc: node[descKey] || '',
          tags: node.tags,
          page: sectionName // e.g. 'projects'
        });
      }
      for (const [key, val] of Object.entries(node)) {
        if (typeof val === 'object') {
          // If the key is one of our main sections, pass it down, otherwise keep current
          const newSection = sectionsToSearch.includes(key) ? key : sectionName;
          extractItems(val, newSection, key);
        }
      }
    }
    
    extractItems(langData, 'home');

    // Find items matching this tag
    const matchingItems = allItems.filter(item => item.tags.includes(currentTag));
    
    // Calculate related tags
    const tagCounts = {};
    matchingItems.forEach(item => {
      item.tags.forEach(t => {
        if (t !== currentTag) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    });
    
    const relatedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Tag Meta Info (if defined in JSON)
    const tagInfo = langData.tags_info && langData.tags_info[currentTag] ? langData.tags_info[currentTag] : {};

    // Build DOM
    let html = `
      <div class="tag-header">
        <h1 class="tag-title">#${currentTag}</h1>
        ${tagInfo.image ? `<img src="${tagInfo.image}" alt="${currentTag}" class="tag-img" />` : ''}
        ${tagInfo.description ? `<p class="tag-desc">${tagInfo.description}</p>` : ''}
        ${tagInfo.link ? `<a href="${tagInfo.link}" target="_blank" class="btn btn-primary" style="text-decoration:none; display:inline-block;">Visit Website</a>` : ''}
      </div>
    `;

    // Render Matching Items
    html += `<h2 class="tag-section-title">Items related to ${currentTag}</h2>`;
    if (matchingItems.length > 0) {
      html += `<ul class="grid-2" role="list">`;
      matchingItems.forEach(item => {
        const pageLink = item.page && sectionsToSearch.includes(item.page) ? `${item.page}.html` : 'index.html';
        html += `
          <li class="card" onclick="window.location.href='./${pageLink}'" style="cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 16px 50px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
            <h3 class="card__title">${item.title}</h3>
            <p class="card__body">${item.desc}</p>
            <div style="margin-top: 1rem;"><a href="./${pageLink}" class="nav-link" style="font-size:0.9rem; font-weight:bold;">View Details &rarr;</a></div>
          </li>
        `;
      });
      html += `</ul>`;
    } else {
      html += `<p class="text-muted">No items found for this tag.</p>`;
    }

    // Render Related Tags (Algorithm)
    if (relatedTags.length > 0) {
      html += `<h2 class="tag-section-title">Related Tags (Auto-suggested)</h2>`;
      html += `<div class="related-tags">`;
      relatedTags.slice(0, 8).forEach(t => {
        const encTag = encodeURIComponent(t);
        html += `<a href="./tag.html?tag=${encTag}" class="badge nav-link">${t}</a>`;
      });
      html += `</div>`;
    }

    container.innerHTML = html;
    
    // Ensure the dynamically added links keep URL params
    setTimeout(() => {
      propagateUrlParams();
    }, 100);

  } catch (e) {
    console.error('Failed to load tag data:', e);
    container.innerHTML = '<h2 style="text-align: center; color: red;">Error loading tag data.</h2>';
  }
}

document.addEventListener('DOMContentLoaded', initTagPage);
