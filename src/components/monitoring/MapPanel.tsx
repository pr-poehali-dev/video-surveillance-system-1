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
}

const MapPanel = ({
  cameras,
  clusteringEnabled,
  isFullscreen,
  onClusteringToggle,
  onFullscreenToggle,
  onCameraClick,
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPanel;
