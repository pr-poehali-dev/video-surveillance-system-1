import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  lat: number;
  lng: number;
}

interface YandexMapProps {
  cameras: Camera[];
  onCameraClick?: (camera: Camera) => void;
  height?: string;
  clusteringEnabled?: boolean;
}

const getColor = (status: string) => {
  switch (status) {
    case 'active': return '#22c55e';
    case 'inactive': return '#ef4444';
    case 'problem': return '#eab308';
    default: return '#6b7280';
  }
};

const createCameraIcon = (status: string) => {
  const color = getColor(status);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
    <path d="M9 12h9l3-3v14l-3-3H9a1 1 0 0 1-1-1V13a1 1 0 0 1 1-1z" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const YandexMap = ({ cameras, onCameraClick, height = '600px' }: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [58.010455, 56.229443],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cameras.forEach((camera) => {
      if (!camera.lat || !camera.lng) return;
      const marker = L.marker([camera.lat, camera.lng], {
        icon: createCameraIcon(camera.status),
      });

      const statusLabel = camera.status === 'active' ? 'Активна' : camera.status === 'inactive' ? 'Неактивна' : 'Проблемная';
      marker.bindPopup(`<b>${camera.name}</b><br/>${camera.address}<br/>Статус: ${statusLabel}`);

      marker.on('click', () => {
        if (onCameraClick) onCameraClick(camera);
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });

    return () => {};
  }, [cameras, onCameraClick]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height }} className="rounded-lg z-0" />;
};

export default YandexMap;