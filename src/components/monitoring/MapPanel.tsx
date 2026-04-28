import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import YandexMap from '@/components/YandexMap';
import { Camera } from '@/lib/api';

interface MapPanelProps {
  cameras: Camera[];
  clusteringEnabled: boolean;
  isFullscreen: boolean;
  onClusteringToggle: () => void;
  onFullscreenToggle: () => void;
  onCameraClick: (camera: Camera) => void;
  previewCamera?: Camera | null;
  onPreviewClose?: () => void;
}

const MapPanel = ({
  cameras,
  clusteringEnabled,
  isFullscreen,
  onClusteringToggle,
  onFullscreenToggle,
  onCameraClick,
  previewCamera,
  onPreviewClose,
}: MapPanelProps) => {
  return (
    <div className="flex-1 h-full">
      <Card className="h-full rounded-none border-0">
        <CardContent className="p-0 h-full">
          <div className="relative overflow-hidden h-full">
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
              onCameraClick={onCameraClick}
              height="100%"
              clusteringEnabled={clusteringEnabled}
            />

            {previewCamera && (
              <div className="absolute bottom-4 left-4 z-10 w-72 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <div className="flex items-center justify-between px-3 py-2 bg-black/80">
                  <div className="flex items-center gap-2">
                    <Icon name="Video" size={14} className="text-white/70" />
                    <span className="text-white text-sm font-medium truncate max-w-[180px]">{previewCamera.name}</span>
                  </div>
                  <button onClick={onPreviewClose} className="text-white/50 hover:text-white transition-colors">
                    <Icon name="X" size={16} />
                  </button>
                </div>
                <div className="aspect-video bg-black flex items-center justify-center">
                  {previewCamera.hls_url ? (
                    <video
                      key={previewCamera.hls_url}
                      src={previewCamera.hls_url}
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
                  <p className="text-white/50 text-xs truncate">{previewCamera.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPanel;
