import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { MOCK_DETECTIONS } from './DetectionsDialog';
import { YandexMap } from './YandexMap';

interface PlateHistoryResultsProps {
  plate: string;
}

export const PlateHistoryResults = ({ plate }: PlateHistoryResultsProps) => {
  const [mapDetIndex, setMapDetIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoDetIndex, setVideoDetIndex] = useState(0);

  const openVideo = useCallback((index: number) => {
    setVideoDetIndex(index);
    setVideoOpen(true);
  }, []);

  const displayPlate = plate || 'А123ВС159';

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Hash" size={20} />
            Результаты поиска
            <Badge variant="secondary" className="ml-1">{MOCK_DETECTIONS.length} совпадений</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mapDetIndex !== null && (
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border" style={{ height: 200 }}>
              <YandexMap
                cameras={MOCK_DETECTIONS.map((d, i) => ({ id: i, lat: d.lat, lng: d.lng, name: d.label, address: d.address, status: 'online' as const }))}
                selectedCamera={mapDetIndex}
                onCameraSelect={() => {}}
              />
            </div>
          )}
          <ScrollArea className="max-h-[480px]">
            <div className="divide-y">
              {MOCK_DETECTIONS.map((det, index) => (
                <div key={index} className="flex items-start gap-4 px-4 py-3">
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-muted border">
                    {det.carImage ? (
                      <img src={det.carImage} alt="Фото автомобиля" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Car" size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-white border-2 border-black rounded px-2 py-0.5 font-mono font-bold text-sm tracking-widest text-black">
                        {displayPlate}
                      </div>
                      <Badge
                        className="text-xs px-1.5"
                        variant={det.match > 92 ? 'default' : 'secondary'}
                      >
                        {det.match}%
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{det.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{det.address} · {det.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={mapDetIndex === index ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setMapDetIndex(mapDetIndex === index ? null : index)}
                    >
                      <Icon name="MapPin" size={12} className="mr-1" />
                      На карте
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => openVideo(index)}
                    >
                      <Icon name="Video" size={12} className="mr-1" />
                      Видео
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Video" size={18} />
              {MOCK_DETECTIONS[videoDetIndex]?.label} — видеозапись
              <DialogClose asChild className="ml-auto">
                <Button size="icon" variant="secondary" title="Закрыть">
                  <Icon name="X" size={18} />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">{MOCK_DETECTIONS[videoDetIndex]?.address} · {MOCK_DETECTIONS[videoDetIndex]?.time}</p>
          <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative mt-2">
            <Icon name="Video" size={56} className="text-white/20" />
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                <Icon name="Play" size={12} className="mr-1" />Воспроизвести
              </Button>
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                <Icon name="Download" size={12} className="mr-1" />Скачать
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
            {MOCK_DETECTIONS.map((det, i) => (
              <button
                key={i}
                onClick={() => setVideoDetIndex(i)}
                className={`flex-shrink-0 rounded-lg border p-2 text-left transition-colors ${videoDetIndex === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                <p className="text-xs font-medium">{det.label}</p>
                <p className="text-xs text-muted-foreground">{det.time.split(' ')[1]}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};