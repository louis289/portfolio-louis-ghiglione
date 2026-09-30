/**
 * map.js — Leaflet mobility map module
 * Renders an interactive world map with destination markers.
 * Coordinates and destination data live here; translations are synced via i18n.
 */

import { t, getCurrentLang, getTranslations } from './i18n.js';

/** @type {import('leaflet').Map | null} */
let mapInstance = null;

/**
 * Gets the current array of destinations from the translation config.
 */
function getDestinations() {
  const trans = getTranslations();
  if (trans && trans.config && trans.config.destinations) {
    return trans.config.destinations;
  }
  return [];
}

/**
 * Reads the translated text of a [data-i18n] element as a fallback.
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
function addMarkers(map, initialLoad = false) {
  const currentLang = getCurrentLang() || 'en';
  const bounds = [];

  getDestinations().forEach(({ lat, lng, city, country, i18nTitle, i18nDesc }) => {
    const title = t(i18nTitle) || getLabel(i18nTitle) || city;
    const desc  = t(i18nDesc)  || getLabel(i18nDesc);
    const countryLabel = typeof country === 'object'
      ? (country[currentLang] || country.en)
      : country;

    const popup = L.popup({ className: 'map-popup', maxWidth: 280 }).setContent(`
      <strong class="map-popup__title">${title}</strong>
      <span class="map-popup__country">${countryLabel}</span>
      <p class="map-popup__desc">${desc}</p>
    `);

    L.marker([lat, lng], { icon: createMarkerIcon(title), alt: title })
      .bindPopup(popup)
      .addTo(map);
      
    bounds.push([lat, lng]);
  });

  if (initialLoad && bounds.length > 0) {
    const padding = window.innerWidth < 768 ? [20, 20] : [40, 40];
    map.fitBounds(bounds, { padding: padding, maxZoom: 4 });
  }
}

/**
 * Removes all existing markers and re-adds them with the current language.
 * Preserves the open state of any active popup.
 * Called automatically when a 'langchange' event is dispatched.
 */
function refreshMapMarkers() {
  if (!mapInstance) return;

  // Check if a popup is currently open and record its position
  let openCoords = null;
  mapInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker && typeof layer.isPopupOpen === 'function' && layer.isPopupOpen()) {
      openCoords = layer.getLatLng();
    }
  });

  // Remove every marker layer
  mapInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker) mapInstance.removeLayer(layer);
  });

  // Re-add with up-to-date translated labels
  addMarkers(mapInstance);

  // Restore open popup if one was active
  if (openCoords) {
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const pos = layer.getLatLng();
        if (Math.abs(pos.lat - openCoords.lat) < 0.001 && Math.abs(pos.lng - openCoords.lng) < 0.001) {
          layer.openPopup();
        }
      }
    });
  }
}

// Automatically refresh markers whenever the language changes
document.addEventListener('langchange', refreshMapMarkers);

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

  addMarkers(mapInstance, true);

  // Force Leaflet to recalculate size once tiles have started loading.
  // Fixes the grey/blank map issue when the container layout isn't settled yet.
  tileLayer.once('load', () => mapInstance.invalidateSize());
  setTimeout(() => mapInstance?.invalidateSize(), 300);
}
