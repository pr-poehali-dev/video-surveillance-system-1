import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
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

interface SectorDef {
  id: string;
  name: string;
  bounds: [number, number][];
  color: string;
  fillColor: string;
}

const DEFAULT_SECTORS: SectorDef[] = [
  { id: 'A', name: 'Сектор А', bounds: [[57.2, 55.5], [57.2, 58.5], [59.5, 58.5], [59.5, 55.5]], color: '#3b82f6', fillColor: '#1d4ed8' },
  { id: 'B', name: 'Сектор Б', bounds: [[59.0, 57.0], [59.0, 60.5], [61.5, 60.5], [61.5, 57.0]], color: '#3b82f6', fillColor: '#1d4ed8' },
];

const SECTOR_COLORS = [
  { label: 'Синий',    color: '#3b82f6', fill: '#1d4ed8' },
  { label: 'Красный',  color: '#ef4444', fill: '#991b1b' },
  { label: 'Жёлтый',  color: '#eab308', fill: '#854d0e' },
  { label: 'Зелёный', color: '#22c55e', fill: '#14532d' },
  { label: 'Фиолет.', color: '#a855f7', fill: '#581c87' },
];

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
  return L.divIcon({ html: svg, className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16] });
};

const BPLAMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const sectorLayersRef = useRef<Record<string, L.Polygon>>({});
  const drawingRef = useRef<{ points: L.LatLng[]; polyline: L.Polyline | null; markers: L.CircleMarker[] }>({ points: [], polyline: null, markers: [] });

  const [sectors, setSectors] = useState<SectorDef[]>(DEFAULT_SECTORS);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorColor, setNewSectorColor] = useState(0);
  const [editName, setEditName] = useState('');

  const sectorsRef = useRef(sectors);
  sectorsRef.current = sectors;

  const renderSectors = useCallback((map: L.Map, sectorList: SectorDef[], selected: string | null) => {
    Object.values(sectorLayersRef.current).forEach(l => l.remove());
    sectorLayersRef.current = {};
    sectorList.forEach(s => {
      const isSelected = s.id === selected;
      const poly = L.polygon(s.bounds as [number, number][], {
        color: s.color,
        weight: isSelected ? 2.5 : 1,
        opacity: isSelected ? 0.9 : 0.35,
        fillColor: s.fillColor,
        fillOpacity: isSelected ? 0.18 : 0.06,
        dashArray: isSelected ? undefined : '4 4',
      }).addTo(map);
      poly.bindTooltip(s.name, { permanent: false, direction: 'center', className: 'text-xs font-mono' });
      poly.on('click', () => {
        setSelectedSector(prev => prev === s.id ? null : s.id);
        setPanelOpen(true);
      });
      sectorLayersRef.current[s.id] = poly;
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: [58.4, 57.0], zoom: 7, zoomControl: true });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);

    const gridLines: [number, number][][] = [];
    for (let lat = 57; lat <= 62; lat += 0.5) gridLines.push([[lat, 54], [lat, 62]]);
    for (let lng = 54; lng <= 62; lng += 0.5) gridLines.push([[56, lng], [62, lng]]);
    gridLines.forEach(line => L.polyline(line, { color: '#3b82f6', weight: 0.4, opacity: 0.15 }).addTo(map));

    TACTICAL_POINTS.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: createDroneIcon(p.threat, p.status) });
      const tl = p.threat === 'high' ? 'Высокая' : p.threat === 'medium' ? 'Средняя' : 'Низкая';
      const sl = p.status === 'active' ? '🔴 Активен' : p.status === 'neutralized' ? '✅ Нейтрализован' : '⚫ Потерян';
      marker.bindPopup(`<div style="font-family:monospace;font-size:12px;min-width:160px"><b>${p.label}</b><br/>Угроза: ${tl}<br/>Статус: ${sl}<br/>Время: ${p.time}<br/><span style="color:#6b7280">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</span></div>`);
      marker.addTo(map);
    });

    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div');
      div.innerHTML = `<div style="background:rgba(0,0,0,0.75);color:#e2e8f0;padding:8px 10px;border-radius:6px;font-size:11px;font-family:monospace;line-height:1.8"><div style="margin-bottom:4px;font-weight:bold;color:#94a3b8">БПЛА / УГРОЗА</div><div><span style="color:#ef4444">●</span> Высокая</div><div><span style="color:#eab308">●</span> Средняя</div><div><span style="color:#22c55e">●</span> Низкая</div></div>`;
      return div;
    };
    legend.addTo(map);

    renderSectors(map, sectorsRef.current, null);

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [renderSectors]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderSectors(mapInstanceRef.current, sectors, selectedSector);
  }, [sectors, selectedSector, renderSectors]);

  const startDraw = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setDrawMode(true);
    drawingRef.current = { points: [], polyline: null, markers: [] };
    map.getContainer().style.cursor = 'crosshair';
    map.on('click', onMapClick);
  };

  const onMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const d = drawingRef.current;
    d.points.push(e.latlng);
    const dot = L.circleMarker(e.latlng, { radius: 5, color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 1 }).addTo(map);
    d.markers.push(dot);
    if (d.polyline) d.polyline.remove();
    d.polyline = L.polyline(d.points, { color: '#f59e0b', weight: 2, dashArray: '4 4' }).addTo(map);
  }, []);

  const finishDraw = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const d = drawingRef.current;
    if (d.points.length < 3) { cancelDraw(); return; }

    const name = newSectorName.trim() || `Сектор ${String.fromCharCode(65 + sectors.length)}`;
    const c = SECTOR_COLORS[newSectorColor];
    const newSector: SectorDef = {
      id: `custom_${Date.now()}`,
      name,
      bounds: d.points.map(p => [p.lat, p.lng] as [number, number]),
      color: c.color,
      fillColor: c.fill,
    };

    d.markers.forEach(m => m.remove());
    if (d.polyline) d.polyline.remove();
    map.off('click', onMapClick);
    map.getContainer().style.cursor = '';
    setDrawMode(false);
    setNewSectorName('');
    setSectors(prev => [...prev, newSector]);
    setSelectedSector(newSector.id);
  };

  const cancelDraw = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const d = drawingRef.current;
    d.markers.forEach(m => m.remove());
    if (d.polyline) d.polyline.remove();
    map.off('click', onMapClick);
    map.getContainer().style.cursor = '';
    setDrawMode(false);
  };

  const deleteSector = (id: string) => {
    setSectors(prev => prev.filter(s => s.id !== id));
    if (selectedSector === id) setSelectedSector(null);
  };

  const renameSector = (id: string) => {
    if (!editName.trim()) return;
    setSectors(prev => prev.map(s => s.id === id ? { ...s, name: editName.trim() } : s));
    setEditName('');
  };

  const changeSectorColor = (id: string, idx: number) => {
    const c = SECTOR_COLORS[idx];
    setSectors(prev => prev.map(s => s.id === id ? { ...s, color: c.color, fillColor: c.fill } : s));
  };

  const selectedSectorData = sectors.find(s => s.id === selectedSector);

  return (
    <Card className="relative z-0">
      <CardContent className="p-0">
        <div className="relative h-96">
          <div ref={mapRef} className="w-full h-full rounded-lg" />

          <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1.5">
            <button
              onClick={() => { setPanelOpen(v => !v); setSelectedSector(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow transition-colors ${panelOpen ? 'bg-primary text-primary-foreground' : 'bg-card/90 hover:bg-card text-foreground border border-border'}`}
            >
              <Icon name="Layers" size={13} />
              Секторы
            </button>
            {!drawMode ? (
              <button
                onClick={() => { setPanelOpen(true); startDraw(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow bg-card/90 hover:bg-card text-foreground border border-border transition-colors"
              >
                <Icon name="PenLine" size={13} />
                Нарисовать
              </button>
            ) : (
              <div className="bg-card/95 border border-border rounded-lg shadow p-2 flex flex-col gap-1.5 min-w-[140px]">
                <p className="text-[11px] text-muted-foreground font-mono">Кликайте точки на карте</p>
                <input
                  value={newSectorName}
                  onChange={e => setNewSectorName(e.target.value)}
                  placeholder="Название сектора"
                  className="text-xs px-2 py-1 rounded border border-border bg-background w-full"
                />
                <div className="flex gap-1 flex-wrap">
                  {SECTOR_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setNewSectorColor(i)}
                      style={{ background: c.color }}
                      className={`w-5 h-5 rounded-full transition-all ${newSectorColor === i ? 'ring-2 ring-white ring-offset-1' : ''}`}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={finishDraw} className="flex-1 text-xs py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors">Готово</button>
                  <button onClick={cancelDraw} className="flex-1 text-xs py-1 rounded bg-muted text-muted-foreground hover:bg-muted/70 transition-colors">Отмена</button>
                </div>
              </div>
            )}
          </div>

          {panelOpen && (
            <div className="absolute top-2 left-2 z-[1000] bg-card/95 border border-border rounded-lg shadow-lg p-3 min-w-[200px] max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Секторы</span>
                <button onClick={() => { setPanelOpen(false); setSelectedSector(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {sectors.map(s => (
                  <div
                    key={s.id}
                    className={`rounded-lg border transition-colors ${selectedSector === s.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                  >
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                      onClick={() => setSelectedSector(prev => prev === s.id ? null : s.id)}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-medium flex-1 truncate">{s.name}</span>
                      <Icon name={selectedSector === s.id ? 'ChevronUp' : 'ChevronDown'} size={12} className="text-muted-foreground" />
                    </div>
                    {selectedSector === s.id && (
                      <div className="px-2 pb-2 space-y-2 border-t border-border/50 pt-2">
                        <div className="flex gap-1">
                          <input
                            value={editName || s.name}
                            onChange={e => setEditName(e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-border bg-background flex-1 min-w-0"
                          />
                          <button
                            onClick={() => renameSector(s.id)}
                            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <Icon name="Check" size={11} />
                          </button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {SECTOR_COLORS.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => changeSectorColor(s.id, i)}
                              style={{ background: c.color }}
                              className={`w-5 h-5 rounded-full transition-all ${s.color === c.color ? 'ring-2 ring-white ring-offset-1 ring-offset-card' : ''}`}
                              title={c.label}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => deleteSector(s.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Icon name="Trash2" size={11} />
                          Удалить сектор
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {sectors.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Нет секторов</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BPLAMap;
