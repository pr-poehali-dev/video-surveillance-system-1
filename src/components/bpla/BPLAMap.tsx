import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_DETECTIONS } from './types';
import type { DroneDetection } from './types';

const TACTICAL_POINTS = MOCK_DETECTIONS.map(d => ({
  id: d.id,
  lat: d.lat,
  lng: d.lng,
  label: `${d.type} / ${d.zone}`,
  threat: d.threat,
  status: d.status,
  time: d.time,
}));

const createDroneIcon = (threat: DroneDetection['threat'], status: DroneDetection['status']) => {
  const color = threat === 'high' ? '#ef4444' : threat === 'medium' ? '#eab308' : '#22c55e';
  const pulse = status === 'active' ? 'animation: bpla-pulse 1.2s ease-in-out infinite;' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5" style="${pulse}"/>
    <circle cx="14" cy="14" r="6" fill="${color}" stroke="white" stroke-width="1.5"/>
    <line x1="14" y1="2" x2="14" y2="8" stroke="${color}" stroke-width="1.5"/>
    <line x1="14" y1="20" x2="14" y2="26" stroke="${color}" stroke-width="1.5"/>
    <line x1="2" y1="14" x2="8" y2="14" stroke="${color}" stroke-width="1.5"/>
    <line x1="20" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="1.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

const BPLAMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [58.4, 57.0],
      zoom: 7,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const tacStyle = {
      color: '#3b82f6',
      weight: 1,
      opacity: 0.25,
      fillColor: '#1d4ed8',
      fillOpacity: 0.05,
      dashArray: '4 4',
    };

    const permBounds: [number, number][][] = [
      [[57.2, 55.5], [57.2, 58.5], [59.5, 58.5], [59.5, 55.5]],
      [[59.0, 57.0], [59.0, 60.5], [61.5, 60.5], [61.5, 57.0]],
    ];
    permBounds.forEach(b => L.polygon(b, tacStyle).addTo(map));

    const gridLines: [number, number][][] = [];
    for (let lat = 57; lat <= 62; lat += 0.5) {
      gridLines.push([[lat, 54], [lat, 62]]);
    }
    for (let lng = 54; lng <= 62; lng += 0.5) {
      gridLines.push([[56, lng], [62, lng]]);
    }
    gridLines.forEach(line =>
      L.polyline(line, { color: '#3b82f6', weight: 0.4, opacity: 0.15 }).addTo(map)
    );

    TACTICAL_POINTS.forEach(p => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createDroneIcon(p.threat, p.status),
      });
      const threatLabel = p.threat === 'high' ? 'Высокая' : p.threat === 'medium' ? 'Средняя' : 'Низкая';
      const statusLabel = p.status === 'active' ? '🔴 Активен' : p.status === 'neutralized' ? '✅ Нейтрализован' : '⚫ Потерян';
      marker.bindPopup(
        `<div style="font-family:monospace;font-size:12px;min-width:160px">
          <b>${p.label}</b><br/>
          Угроза: ${threatLabel}<br/>
          Статус: ${statusLabel}<br/>
          Время: ${p.time}<br/>
          <span style="color:#6b7280">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</span>
        </div>`
      );
      marker.addTo(map);
    });

    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div');
      div.innerHTML = `
        <div style="background:rgba(0,0,0,0.75);color:#e2e8f0;padding:8px 10px;border-radius:6px;font-size:11px;font-family:monospace;line-height:1.8">
          <div style="margin-bottom:4px;font-weight:bold;color:#94a3b8">БПЛА / УГРОЗА</div>
          <div><span style="color:#ef4444">●</span> Высокая</div>
          <div><span style="color:#eab308">●</span> Средняя</div>
          <div><span style="color:#22c55e">●</span> Низкая</div>
        </div>`;
      return div;
    };
    legend.addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <Card className="relative z-0">
      <CardContent className="p-0">
        <div className="h-96">
          <div ref={mapRef} className="w-full h-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BPLAMap;