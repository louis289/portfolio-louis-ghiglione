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
    const lang = urlParams.get('lang') || localStorage.getItem('site_lang') || 'en';
    const isFr = lang.startsWith('fr');
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
          page: sectionName
        });
      }
      for (const [key, val] of Object.entries(node)) {
        if (typeof val === 'object') {
          const newSection = sectionsToSearch.includes(key) ? key : sectionName;
          extractItems(val, newSection, key);
        }
      }
    }
    
    extractItems(langData, 'home');

    // Case-insensitive search
    const currentTagNorm = currentTag.trim().toLowerCase();
    const matchingItems = allItems.filter(item => 
      Array.isArray(item.tags) && item.tags.some(t => t.trim().toLowerCase() === currentTagNorm)
    );
    
    // Calculate related tags
    const tagCounts = {};
    matchingItems.forEach(item => {
      item.tags.forEach(t => {
        if (t.trim().toLowerCase() !== currentTagNorm) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    });
    
    const relatedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Tag Meta Info / Lexicon (case-insensitive lookup)
    const tagsInfo = langData.tags_info || {};
    const matchedKey = Object.keys(tagsInfo).find(k => k.toLowerCase() === currentTagNorm);
    const tagInfo = matchedKey ? tagsInfo[matchedKey] : (tagsInfo[currentTag] || {});

    const sectionLabels = {
      projects: isFr ? 'PROJET' : 'PROJECT',
      passions: isFr ? 'PASSION' : 'PASSION',
      civic: isFr ? 'ENGAGEMENT CIVIQUE' : 'CIVIC ENGAGEMENT',
      career: isFr ? 'PARCOURS PRO' : 'CAREER'
    };

    // Build DOM
    let html = `
      <header class="page-header" style="margin-bottom: 2rem;">
        <span class="section-tag">${isFr ? 'Exploration par Mots-Clés' : 'Keyword Exploration'}</span>
        <h1 class="section-title">#${currentTag}</h1>
        <p class="section-desc">
          ${isFr 
            ? `Découvrez les projets, passions et engagements reliés à <strong>${currentTag}</strong> ainsi que sa définition technique.` 
            : `Discover all projects, passions and civic engagements associated with <strong>${currentTag}</strong> and its engineering definition.`}
        </p>
      </header>
    `;

    // Lexicon / Definition Box
    if (tagInfo.description) {
      html += `
        <article class="card uvp-card" style="max-width: 100%; margin-bottom: 2.5rem; border-color: var(--color-accent); background: color-mix(in srgb, var(--color-surface) 90%, var(--color-accent) 10%);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <span class="section-tag" style="background: rgba(109, 74, 255, 0.2); border-color: var(--color-accent); color: var(--color-accent2);">
              ${tagInfo.category || (isFr ? 'Lexique & Définition' : 'Lexicon & Definition')}
            </span>
          </div>
          <h2 style="font-size: 1.4rem; color: var(--color-text); margin-bottom: 0.75rem;">
            ${isFr ? 'Que signifie ce terme ?' : 'What does this term mean?'}
          </h2>
          <p class="card__body" style="font-size: 1.05rem; line-height: 1.7; color: var(--color-text);">
            ${tagInfo.description}
          </p>
          ${tagInfo.link && tagInfo.link !== '#' ? `
            <div style="margin-top: 1.25rem;">
              <a href="${tagInfo.link}" target="_blank" rel="noopener" class="hero__cta" style="padding: 0.5rem 1.25rem; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 0.5rem;">
                ${isFr ? 'Visiter la ressource / site officiel' : 'Visit Official Resource / Website'} &rarr;
              </a>
            </div>
          ` : ''}
        </article>
      `;
    }

    // Render Matching Items
    const itemsHeading = isFr 
      ? `Éléments du Portfolio reliés (${matchingItems.length})` 
      : `Associated Portfolio Items (${matchingItems.length})`;

    html += `<h2 class="tag-section-title" style="margin-bottom: 1.5rem;">${itemsHeading}</h2>`;
    
    if (matchingItems.length > 0) {
      html += `<ul class="grid-2" role="list">`;
      matchingItems.forEach(item => {
        const pageLink = item.page && sectionsToSearch.includes(item.page) ? `${item.page}.html` : 'index.html';
        const secLabel = sectionLabels[item.page] || (isFr ? 'PORTFOLIO' : 'PORTFOLIO');
        
        // Tags pills for card
        const otherTagsHtml = item.tags.slice(0, 4).map(t => {
          const enc = encodeURIComponent(t);
          const isCurrent = t.toLowerCase() === currentTagNorm;
          const style = isCurrent ? 'background: var(--color-accent); color:#fff; border-color:var(--color-accent);' : '';
          return `<a href="./tag.html?tag=${enc}" class="badge nav-link" style="${style}" onclick="event.stopPropagation();">${t}</a>`;
        }).join(' ');

        html += `
          <li class="card" onclick="window.location.href='./${pageLink}'" style="cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <span class="section-tag" style="margin:0; font-size:0.7rem; padding:0.15rem 0.6rem; letter-spacing:0.08em;">${secLabel}</span>
              </div>
              <h3 class="card__title" style="margin-top:0.25rem;">${item.title}</h3>
              <p class="card__body" style="margin-top:0.5rem;">${item.desc}</p>
            </div>
            <div style="margin-top: 1.25rem;">
              <div style="margin-bottom: 0.75rem;">${otherTagsHtml}</div>
              <a href="./${pageLink}" class="ext-link" style="font-size:0.88rem; font-weight:600;">
                ${isFr ? 'Consulter la page' : 'View Page'} &rarr;
              </a>
            </div>
          </li>
        `;
      });
      html += `</ul>`;
    } else {
      html += `
        <div class="card" style="text-align:center; padding: 2rem;">
          <p class="text-muted" style="font-size: 1.1rem;">
            ${isFr ? 'Aucun élément trouvé pour ce tag.' : 'No portfolio items found for this tag.'}
          </p>
        </div>
      `;
    }

    // Render Related Tags (Algorithm)
    if (relatedTags.length > 0) {
      const relHeading = isFr ? 'Mots-clés associés (Recommandations)' : 'Related Tags (Auto-suggested)';
      html += `<h2 class="tag-section-title" style="margin-top: 3rem; margin-bottom: 1rem;">${relHeading}</h2>`;
      html += `<div class="related-tags" style="display:flex; flex-wrap:wrap; gap:0.5rem;">`;
      relatedTags.slice(0, 12).forEach(t => {
        const encTag = encodeURIComponent(t);
        html += `<a href="./tag.html?tag=${encTag}" class="badge nav-link" style="padding:0.4rem 0.9rem; font-size:0.85rem;">#${t}</a>`;
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
