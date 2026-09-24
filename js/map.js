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
 * Builds a Leaflet divIcon using the .map-marker CSS class.
 * @param {string} title  Accessible label for the marker
 * @returns {L.DivIcon}
 */
function createMarkerIcon(title) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker" title="${title}" aria-label="${title}"></div>`,
    iconSize:    [14, 14],
    iconAnchor:  [7, 7],
    popupAnchor: [0, -10],
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

  mapInstance = L.map('mobility-map', {
    center: [30, 10],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true,
  });

  // CartoDB Dark Matter tiles — no API key needed
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  ).addTo(mapInstance);

  addMarkers(mapInstance);
}
