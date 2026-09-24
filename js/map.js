/**
 * map.js — Leaflet mobility map module
 * Initializes an interactive world map with destination markers.
 * Destination data is defined here (coordinates are not translatable).
 * Labels are injected from translations after i18n is ready.
 */

/** @type {import('leaflet').Map | null} */
let mapInstance = null;

/**
 * Destination definitions — coordinates only.
 * Labels come from translations.json (mobility.d1_title, etc.)
 * @type {Array<{ id: string, lat: number, lng: number, i18nTitle: string, i18nDesc: string }>}
 */
const DESTINATIONS = [
  {
    id: 'dest-1',
    lat: 48.8566,
    lng: 2.3522,
    i18nTitle: 'mobility.d1_title',
    i18nDesc:  'mobility.d1_desc',
  },
  {
    id: 'dest-2',
    lat: 51.5074,
    lng: -0.1278,
    i18nTitle: 'mobility.d2_title',
    i18nDesc:  'mobility.d2_desc',
  },
  {
    id: 'dest-3',
    lat: 35.6762,
    lng: 139.6503,
    i18nTitle: 'mobility.d3_title',
    i18nDesc:  'mobility.d3_desc',
  },
];

/**
 * Resolves a dot-separated i18n key from the DOM.
 * Falls back to the key itself if not found.
 * @param {string} keyPath
 * @returns {string}
 */
function getTranslation(keyPath) {
  // Read from already-rendered data-i18n elements as source of truth
  const el = document.querySelector(`[data-i18n="${keyPath}"]`);
  return el?.textContent?.trim() || keyPath;
}

/**
 * Initializes the Leaflet map in #mobility-map.
 * Safe to call multiple times — skips if already initialized.
 */
export function initMap() {
  if (mapInstance) return;

  const container = document.getElementById('mobility-map');
  if (!container || typeof L === 'undefined') return;

  // Dark tile layer (CartoDB Dark Matter — no API key required)
  mapInstance = L.map('mobility-map', {
    center: [30, 10],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }
  ).addTo(mapInstance);

  // Custom marker icon matching the design palette
  const markerIcon = L.divIcon({
    className: '',
    html: `<div class="map-marker" aria-hidden="true"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });

  // Add markers with translated popups
  DESTINATIONS.forEach((dest) => {
    const title = getTranslation(dest.i18nTitle);
    const desc  = getTranslation(dest.i18nDesc);

    const popup = L.popup({
      className: 'map-popup',
      maxWidth: 260,
    }).setContent(`
      <strong class="map-popup__title">${title}</strong>
      <p class="map-popup__desc">${desc}</p>
    `);

    L.marker([dest.lat, dest.lng], { icon: markerIcon, alt: title })
      .bindPopup(popup)
      .addTo(mapInstance);
  });
}

/**
 * Refreshes marker popup text after a language switch.
 * (Removes and re-adds all markers with updated labels.)
 */
export function refreshMapLabels() {
  if (!mapInstance) return;

  // Remove all existing layers except tile layer
  mapInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker) mapInstance.removeLayer(layer);
  });

  // Re-add with fresh translations
  initMap._addMarkers?.();
}
