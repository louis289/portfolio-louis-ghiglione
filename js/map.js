/**
 * map.js — Leaflet mobility map module
 * Renders an interactive world map with destination markers.
 * Coordinates live here; labels are pulled from the already-rendered DOM.
 */

/** @type {import('leaflet').Map | null} */
let mapInstance = null;

/**
 * Destination data.
 * `i18nTitle` / `i18nDesc` → keys used in translations.json.
 * Update coordinates when real destinations are known.
 *
 * @type {Array<{
 *   id: string,
 *   lat: number,
 *   lng: number,
 *   i18nTitle: string,
 *   i18nDesc: string
 * }>}
 */
const DESTINATIONS = [
  {
    id: 'dest-1',
    lat: 41.3851,
    lng: 2.1734,
    city: 'Barcelona',
    country: '🇪🇸 Espagne / Spain',
    i18nTitle: 'mobility.d1_title',
    i18nDesc:  'mobility.d1_desc',
  },
  {
    id: 'dest-2',
    lat: 45.5017,
    lng: -73.5673,
    city: 'Montréal',
    country: '🇨🇦 Canada',
    i18nTitle: 'mobility.d2_title',
    i18nDesc:  'mobility.d2_desc',
  },
  {
    id: 'dest-3',
    lat: 1.3521,
    lng: 103.8198,
    city: 'Singapour / Singapore',
    country: '🇸🇬 Singapore',
    i18nTitle: 'mobility.d3_title',
    i18nDesc:  'mobility.d3_desc',
  },
];

/**
 * Reads the translated text of a [data-i18n] element.
 * Falls back to the key path if the element is not found.
 * @param {string} keyPath
 * @returns {string}
 */
function getLabel(keyPath) {
  return document.querySelector(`[data-i18n="${keyPath}"]`)?.textContent?.trim() || keyPath;
}

/**
 * Builds an SVG location-pin icon in the portfolio gradient.
 * @param {string} title  Accessible label
 * @returns {L.DivIcon}
 */
function createMarkerIcon(title) {
  // Unique gradient ID per marker to avoid SVG defs collision
  const gradId = `pin-grad-${Math.random().toString(36).slice(2, 7)}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#6d4aff"/>
          <stop offset="100%" stop-color="#00d4ff"/>
        </linearGradient>
      </defs>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z"
            fill="url(#${gradId})" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <circle cx="14" cy="13" r="5" fill="white" opacity="0.95"/>
    </svg>
  `;
  return L.divIcon({
    className: '',
    html: svg,
    iconSize:    [28, 40],
    iconAnchor:  [14, 40],   // tip of the pin
    popupAnchor: [0,  -42],  // popup opens above the pin
  });
}

/**
 * Adds all destination markers to the map with translated popups.
 * @param {L.Map} map
 */
function addMarkers(map) {
  DESTINATIONS.forEach(({ lat, lng, city, country, i18nTitle, i18nDesc }) => {
    const title = getLabel(i18nTitle) || city;
    const desc  = getLabel(i18nDesc);

    const popup = L.popup({ className: 'map-popup', maxWidth: 280 }).setContent(`
      <strong class="map-popup__title">${title}</strong>
      <span class="map-popup__country">${country}</span>
      <p class="map-popup__desc">${desc}</p>
    `);

    L.marker([lat, lng], { icon: createMarkerIcon(title), alt: title })
      .bindPopup(popup)
      .addTo(map);
  });
}

/**
 * Initialises the Leaflet map in #mobility-map.
 * Safe to call multiple times — no-ops if already initialised.
 */
export function initMap() {
  if (mapInstance) return;

  const container = document.getElementById('mobility-map');
  if (!container) {
    console.warn('[map] #mobility-map not found.');
    return;
  }
  if (typeof L === 'undefined') {
    console.error('[map] Leaflet (L) is not loaded.');
    return;
  }

  // Guarantee a minimum rendered height so Leaflet can measure the container.
  // The CSS rule sets 400px, this is a safety fallback.
  if (container.offsetHeight === 0) {
    container.style.height = '400px';
  }

  mapInstance = L.map('mobility-map', {
    center: [30, 10],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true,
  });

  // ESRI World Dark Gray Base — free, no API key required
  const tileLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    }
  ).addTo(mapInstance);

  // Reference layer (labels) to show city/country names
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 16, pane: 'overlayPane' }
  ).addTo(mapInstance);

  addMarkers(mapInstance);

  // Force Leaflet to recalculate size once tiles have started loading.
  // Fixes the grey/blank map issue when the container layout isn't settled yet.
  tileLayer.once('load', () => mapInstance.invalidateSize());
  setTimeout(() => mapInstance?.invalidateSize(), 300);
}
