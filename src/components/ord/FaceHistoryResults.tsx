import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { MOCK_DETECTIONS } from './DetectionsDialog';
import { YandexMap } from './YandexMap';

const QUERY_IMAGE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';

export const FaceHistoryResults = () => {
  const [mapDetIndex, setMapDetIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoDetIndex, setVideoDetIndex] = useState(0);

  const openVideo = useCallback((index: number) => {
    setVideoDetIndex(index);
    setVideoOpen(true);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={20} />
            Результаты поиска
            <Badge variant="secondary" className="ml-1">{MOCK_DETECTIONS.length} совпадений</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {mapDetIndex !== null && (
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border" style={{ height: 200 }}>
              <YandexMap
                cameras={MOCK_DETECTIONS.map((d, i) => ({ id: i, lat: d.lat, lng: d.lng, name: d.label, address: d.address, status: 'online' as const }))}
                selectedCamera={mapDetIndex}
                onCameraSelect={() => {}}
              />
            </div>
          )}
          <ScrollArea className="max-h-[560px]">
            <div className="flex flex-col divide-y">
              {MOCK_DETECTIONS.map((det, index) => (
                <div key={index} className="flex gap-4 items-start p-4">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Искомое</p>
                    <div className="w-28 h-36 rounded-lg overflow-hidden bg-muted">
                      <img src={QUERY_IMAGE} alt="Искомое" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Найдено</p>
                    <div className="relative w-28 h-36 rounded-lg overflow-hidden bg-muted">
                      {det.image ? (
                        <img src={det.image} alt="Найденное лицо" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="User" size={40} className="text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        className="absolute bottom-1.5 right-1.5 text-xs px-1.5 py-0"
                        variant={det.match > 92 ? 'default' : 'secondary'}
                      >
                        {det.match}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 py-1">
                    <p className="font-semibold text-sm">{det.label}</p>
                    <p className="text-xs text-muted-foreground">{det.address}</p>
                    <p className="text-xs text-muted-foreground">{det.time}</p>
                    <div className="flex gap-1 pt-2">
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
