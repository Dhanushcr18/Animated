'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RouteInfo {
  from: string;
  to: string;
  time: string;
  minutes: number;
  fromCoords: [number, number];
  toCoords: [number, number];
  center: [number, number];
  zoom: number;
}

// ─── Route data (real geographic coordinates) ────────────────────────────────
const ROUTES: Record<string, RouteInfo> = {
  'Downtown LA': {
    from: 'LAX Airport', to: 'Downtown LA', time: '12 min', minutes: 12,
    fromCoords: [-118.408, 33.943], toCoords: [-118.243, 34.052],
    center: [-118.34, 33.993], zoom: 10.5,
  },
  Manhattan: {
    from: 'JFK Airport', to: 'Manhattan', time: '18 min', minutes: 18,
    fromCoords: [-73.779, 40.641], toCoords: [-73.985, 40.758],
    center: [-73.88, 40.695], zoom: 10.5,
  },
  'Palm Jumeirah': {
    from: 'DXB Airport', to: 'Palm Jumeirah', time: '8 min', minutes: 8,
    fromCoords: [55.364, 25.253], toCoords: [55.117, 25.112],
    center: [55.24, 25.18], zoom: 11,
  },
};

const DESTINATIONS = Object.keys(ROUTES);

// ─── Blue palette ─────────────────────────────────────────────────────────────
const BLUE_BG     = '#1d72ea';
const BLUE_STREET = '#1248b8';
const BLUE_MAJOR  = '#0d3590';

// ─── Override all map layer colours to monochromatic blue ────────────────────
function paintBlue(map: any) {
  map.getStyle().layers.forEach((layer: any) => {
    try {
      switch (layer.type) {
        case 'background':
          map.setPaintProperty(layer.id, 'background-color', BLUE_BG); break;
        case 'fill':
          map.setPaintProperty(layer.id, 'fill-color', BLUE_BG);
          try { map.setPaintProperty(layer.id, 'fill-opacity', 1); } catch { /* skip */ }
          try { map.setPaintProperty(layer.id, 'fill-outline-color', BLUE_STREET); } catch { /* skip */ }
          break;
        case 'fill-extrusion':
          map.setPaintProperty(layer.id, 'fill-extrusion-color', BLUE_STREET);
          try { map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0.5); } catch { /* skip */ }
          break;
        case 'line': {
          const id = layer.id.toLowerCase();
          const isMajor = ['motorway','trunk','primary','secondary'].some(k => id.includes(k));
          map.setPaintProperty(layer.id, 'line-color', isMajor ? BLUE_MAJOR : BLUE_STREET);
          break;
        }
        case 'symbol':
          try { map.setPaintProperty(layer.id, 'text-opacity', 0); } catch { /* skip */ }
          try { map.setPaintProperty(layer.id, 'icon-opacity', 0); } catch { /* skip */ }
          break;
      }
    } catch { /* skip */ }
  });
}

// ─── Quadratic-bezier arc in geographic space ────────────────────────────────
function computeArc(from: [number, number], to: [number, number], n = 80): [number, number][] {
  const midLng = (from[0] + to[0]) / 2;
  const dist   = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2);
  const ctrl: [number, number] = [midLng, Math.max(from[1], to[1]) + dist * 0.7];
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [
      (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * ctrl[0] + t ** 2 * to[0],
      (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * ctrl[1] + t ** 2 * to[1],
    ] as [number, number];
  });
}

// ─── Add start dot + label and destination badge markers ─────────────────────
function addRouteMarkers(map: any, mgl: any, route: RouteInfo): any[] {
  // Origin: small open circle
  const startDot = document.createElement('div');
  Object.assign(startDot.style, {
    width: '12px', height: '12px',
    border: '2.5px solid white', borderRadius: '50%',
    background: 'transparent',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.2)',
  });
  const m1 = new mgl.Marker({ element: startDot, anchor: 'center' })
    .setLngLat(route.fromCoords).addTo(map);

  // Origin label
  const startLabel = document.createElement('div');
  Object.assign(startLabel.style, {
    color: 'white', fontSize: '12px',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    whiteSpace: 'nowrap', paddingLeft: '18px', paddingTop: '2px',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  });
  startLabel.textContent = route.from;
  const m2 = new mgl.Marker({ element: startLabel, anchor: 'top-left' })
    .setLngLat(route.fromCoords).addTo(map);

  // Destination badge
  const badge = document.createElement('div');
  badge.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:none;';
  badge.innerHTML = `
    <div style="background:#fef9c3;border-radius:50%;width:76px;height:76px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      box-shadow:0 6px 28px rgba(0,0,0,0.35);">
      <span style="font-size:30px;font-weight:700;color:#1d4ed8;line-height:1;">${route.minutes}</span>
      <span style="font-size:11px;color:#1d4ed8;font-weight:600;letter-spacing:0.04em;">min</span>
    </div>
    <div style="color:white;font-size:13px;font-family:ui-sans-serif,system-ui,sans-serif;
      font-weight:500;margin-top:9px;text-align:center;
      text-shadow:0 2px 6px rgba(0,0,0,0.5);">${route.to}</div>
  `;
  const m3 = new mgl.Marker({ element: badge, anchor: 'bottom', offset: [0, -4] })
    .setLngLat(route.toCoords).addTo(map);

  return [m1, m2, m3];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RouteMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const animRef      = useRef<number>(0);
  const markersRef   = useRef<any[]>([]);

  const [active, setActive]     = useState('Downtown LA');
  const [mapReady, setMapReady] = useState(false);

  // ── Initialise map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let map: any;

    (async () => {
      const mgl   = (await import('maplibre-gl')).default;
      const route = ROUTES['Downtown LA'];

      map = new mgl.Map({
        container: containerRef.current!,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: route.center,
        zoom: route.zoom,
        interactive: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Ensure canvas fills container after mount
      map.once('idle', () => map.resize());

      map.on('load', () => {
        map.resize();
        paintBlue(map);

        map.addSource('arc', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
        });
        map.addLayer({
          id: 'arc-line',
          type: 'line',
          source: 'arc',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 2.5, 'line-opacity': 0.95 },
        });

        setMapReady(true);
      });
    })();

    return () => { cancelAnimationFrame(animRef.current); map?.remove(); };
  }, []);

  // ── Animate route ─────────────────────────────────────────────────────────
  const animateRoute = useCallback(async (routeKey: string) => {
    const map = mapRef.current;
    if (!map) return;

    const route     = ROUTES[routeKey];
    const arcCoords = computeArc(route.fromCoords, route.toCoords);

    // Clear previous markers & arc
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    cancelAnimationFrame(animRef.current);

    (map.getSource('arc') as any)?.setData({
      type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {},
    });

    // Fly to new route
    map.flyTo({ center: route.center, zoom: route.zoom, duration: 900, essential: true });

    // Wait for fly animation, then draw arc
    await new Promise<void>(resolve => setTimeout(resolve, 1060));

    const start    = performance.now();
    const duration = 1600;

    const tick = (now: number) => {
      const raw   = Math.min((now - start) / duration, 1);
      const eased = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
      const n     = Math.max(2, Math.floor(eased * arcCoords.length));

      (map.getSource('arc') as any)?.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: arcCoords.slice(0, n) },
        properties: {},
      });

      if (raw < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        import('maplibre-gl').then(({ default: mgl }) => {
          markersRef.current = addRouteMarkers(map, mgl, route);
        });
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (mapReady) animateRoute(active);
  }, [mapReady, active, animateRoute]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full py-16 px-5 md:px-14" style={{ backgroundColor: '#050505' }}>
      {/* Section header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
        <span className="text-[9px] tracking-[0.55em] font-light uppercase" style={{ color: 'rgba(201,168,76,0.7)' }}>03 — Routes</span>
        <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
      </div>

    <section className="relative w-full overflow-hidden rounded-[28px]" style={{ height: '65vh', minHeight: '520px', backgroundColor: '#1d72ea' }}>
      {/* MapLibre canvas fills the section */}
      <div ref={containerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Gradient so nav text is readable over the map */}
      <div
        className="absolute left-0 top-0 bottom-0 w-80 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, rgba(15,60,180,0.88) 0%, transparent 100%)' }}
      />

      {/* Left nav */}
      <nav className="absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-center px-10 py-16 w-64">
        <p className="text-blue-200 text-xs tracking-[0.35em] mb-8 uppercase">Select Route</p>

        {DESTINATIONS.map(dest => (
          <button
            key={dest}
            onClick={() => setActive(dest)}
            className={`text-left py-4 px-5 rounded-xl mb-1 transition-all duration-300 text-sm font-medium ${
              active === dest
                ? 'bg-white/20 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            {dest}
          </button>
        ))}

        <div className="mt-10 border-t border-white/20 pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-blue-200 text-xs tracking-widest mb-1 uppercase">Flight time</p>
              <p className="text-white text-4xl font-bold">{ROUTES[active].time}</p>
              <p className="text-blue-200 text-xs mt-2">
                {ROUTES[active].from} → {ROUTES[active].to}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </nav>

      {/* OSM attribution (required) */}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-20 text-white/40 text-[10px] hover:text-white/60 transition-colors"
      >
        © OpenStreetMap contributors
      </a>
    </section>
    </div>
  );
}
