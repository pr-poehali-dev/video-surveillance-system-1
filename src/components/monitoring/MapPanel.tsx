import { useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import YandexMap from '@/components/YandexMap';
import { Camera } from '@/lib/api';

interface PreviewItem {
  camera: Camera;
  x: number;
  y: number;
}

interface MapPanelProps {
  cameras: Camera[];
  clusteringEnabled: boolean;
  isFullscreen: boolean;
  onClusteringToggle: () => void;
  onFullscreenToggle: () => void;
  onCameraClick: (camera: Camera) => void;
  previewCamera?: Camera | null;
  onPreviewClose?: () => void;
  focusCameraId?: number | null;
}

const CameraPreview = ({
  item,
  onClose,
  onBringToFront,
  zIndex,
  containerRef,
}: {
  item: PreviewItem;
  onClose: (id: number) => void;
  onBringToFront: (id: number) => void;
  zIndex: number;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onBringToFront(item.camera.id);

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = Math.min(Math.max(0, ev.clientX - offset.current.x), rect.width - 288);
      const ny = Math.min(Math.max(0, ev.clientY - offset.current.y), rect.height - 180);
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos, item.camera.id, onBringToFront, containerRef]);

  return (
    <div
      className="absolute w-72 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none"
      style={{ left: pos.x, top: pos.y, zIndex }}
      onMouseDown={() => onBringToFront(item.camera.id)}
    >
      <div
        className="flex items-center justify-between px-3 py-2 bg-black/80 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <Icon name="GripHorizontal" size={14} className="text-white/40" />
          <Icon name="Video" size={14} className="text-white/70" />
          <span className="text-white text-sm font-medium truncate max-w-[160px]">{item.camera.name}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(item.camera.id); }}
          className="text-white/50 hover:text-white transition-colors"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
      <div className="aspect-video bg-black flex items-center justify-center">
        {item.camera.hls_url ? (
          <video
            key={item.camera.hls_url}
            src={item.camera.hls_url}
            autoPlay
            muted
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Icon name="VideoOff" size={32} className="text-white/30" />
            <p className="text-white/40 text-xs">Поток не настроен</p>
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 bg-black/80">
        <p className="text-white/50 text-xs truncate">{item.camera.address}</p>
      </div>
    </div>
  );
};

const MapPanel = ({
  cameras,
  clusteringEnabled,
  isFullscreen,
  onClusteringToggle,
  onFullscreenToggle,
  onCameraClick,
  previewCamera,
  onPreviewClose,
  focusCameraId,
}: MapPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [zOrders, setZOrders] = useState<number[]>([]);
  const [maxZ, setMaxZ] = useState(20);

  const addPreview = useCallback((camera: Camera) => {
    setPreviews(prev => {
      if (prev.find(p => p.camera.id === camera.id)) return prev;
      const offset = prev.length * 20;
      const newItem = { camera, x: 16 + offset, y: (containerRef.current?.clientHeight ?? 400) - 200 - offset };
      setZOrders(z => [...z, maxZ + 1]);
      setMaxZ(m => m + 1);
      return [...prev, newItem];
    });
  }, [maxZ]);

  const removePreview = useCallback((id: number) => {
    setPreviews(prev => {
      const idx = prev.findIndex(p => p.camera.id === id);
      setZOrders(z => z.filter((_, i) => i !== idx));
      return prev.filter(p => p.camera.id !== id);
    });
  }, []);

  const bringToFront = useCallback((id: number) => {
    setPreviews(prev => {
      const idx = prev.findIndex(p => p.camera.id === id);
      if (idx === -1) return prev;
      setMaxZ(m => {
        const next = m + 1;
        setZOrders(z => z.map((v, i) => i === idx ? next : v));
        return next;
      });
      return prev;
    });
  }, []);

  const handleCameraClickFromMap = useCallback((camera: Camera) => {
    onCameraClick(camera);
  }, [onCameraClick]);

  if (previewCamera) {
    const alreadyOpen = previews.find(p => p.camera.id === previewCamera.id);
    if (!alreadyOpen) {
      addPreview(previewCamera);
      onPreviewClose?.();
    } else {
      onPreviewClose?.();
    }
  }

  return (
    <div className="flex-1 h-full">
      <Card className="h-full rounded-none border-0">
        <CardContent className="p-0 h-full">
          <div className="relative overflow-hidden h-full" ref={containerRef}>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 mx-0 py-[345px]">
              <Button
                variant="outline"
                size="icon"
                onClick={onClusteringToggle}
                title={clusteringEnabled ? 'Отключить кластеризацию' : 'Включить кластеризацию'}
                className="bg-background shadow-lg"
              >
                <Icon name={clusteringEnabled ? 'Layers' : 'Grid3x3'} size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onFullscreenToggle}
                title="Полноэкранный режим"
                className="bg-background shadow-lg"
              >
                <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} />
              </Button>
            </div>
            <YandexMap
              cameras={cameras}
              onCameraClick={handleCameraClickFromMap}
              height="100%"
              clusteringEnabled={clusteringEnabled}
              focusCameraId={focusCameraId}
            />

            {previews.map((item, idx) => (
              <CameraPreview
                key={item.camera.id}
                item={item}
                onClose={removePreview}
                onBringToFront={bringToFront}
                zIndex={zOrders[idx] ?? 20}
                containerRef={containerRef}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPanel;