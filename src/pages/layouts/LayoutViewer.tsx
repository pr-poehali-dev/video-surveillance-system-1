import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LayoutConfig, CameraItem, GridOption } from './types';

interface LayoutViewerProps {
  selectedLayout: LayoutConfig | null;
  cameras: CameraItem[];
  gridOptions: GridOption[];
  isFullscreen: boolean;
  onFullscreen: () => void;
  onOpenSettings: () => void;
  onCreateLayout: () => void;
  layoutContainerRef: React.RefObject<HTMLDivElement>;
}

export const LayoutViewer = ({
  selectedLayout,
  cameras,
  gridOptions,
  isFullscreen,
  onFullscreen,
  onOpenSettings,
  onCreateLayout,
  layoutContainerRef,
}: LayoutViewerProps) => {
  const getGridConfig = (grid: number) => {
    const config = gridOptions.find((opt) => opt.value === grid.toString());
    return config || gridOptions[2];
  };

  const currentGrid = selectedLayout ? getGridConfig(selectedLayout.grid) : gridOptions[2];

  return (
    <main className="flex-1 p-6 bg-muted/20">
      {selectedLayout ? (
        <div className="h-full" ref={layoutContainerRef}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedLayout.name}</h2>
              <p className="text-sm text-muted-foreground">
                Сетка {currentGrid.cols}×{currentGrid.rows}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onFullscreen}>
                <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} className="mr-2" />
                {isFullscreen ? 'Выйти' : 'Полный экран'}
              </Button>
              <Button variant="outline" onClick={onOpenSettings}>
                <Icon name="Settings" size={18} className="mr-2" />
                Настроить камеры
              </Button>
            </div>
          </div>

          <div
            className="grid gap-4 h-[calc(100%-80px)]"
            style={{
              gridTemplateColumns: `repeat(${currentGrid.cols}, 1fr)`,
              gridTemplateRows: `repeat(${currentGrid.rows}, 1fr)`,
            }}
          >
            {Array.from({ length: selectedLayout.grid }).map((_, index) => {
              const camera = cameras[index % cameras.length];
              return (
                <Card
                  key={index}
                  className="border-border/50 overflow-hidden group hover:shadow-xl transition-all"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Icon
                            name="Video"
                            size={48}
                            className="text-muted-foreground mx-auto mb-2 opacity-50"
                          />
                          <p className="text-sm text-muted-foreground">
                            {camera.name}
                          </p>
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Icon name="Maximize2" size={14} />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Icon name="Volume2" size={14} />
                        </Button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="flex items-center justify-between text-white text-xs">
                          <div>
                            <p className="font-medium">{camera.name}</p>
                            <p className="text-white/80 text-xs">{camera.address}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>LIVE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Icon name="Grid3x3" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет выбранной раскладки</h3>
            <p className="text-muted-foreground mb-4">
              Выберите раскладку или создайте новую
            </p>
            <Button onClick={onCreateLayout}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать раскладку
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};
