import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { SearchResult } from './SearchResultCard';
import { Recognition, fetchRecognitions, toMapPoints } from './ordApi';
import { RecognitionVideoDialog } from './RecognitionVideoDialog';
import { DetectionPhotoCanvas } from './DetectionPhotoCanvas';

interface DetectionsDialogProps {
  selected: SearchResult | null;
  onClose: () => void;
}

export const DetectionsDialog = ({ selected, onClose }: DetectionsDialogProps) => {
  const [detections, setDetections] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapDetIndex, setMapDetIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoDetIndex, setVideoDetIndex] = useState(0);
  const [photoDetIndex, setPhotoDetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!selected) {
      setDetections([]);
      return;
    }
    setLoading(true);
    fetchRecognitions({ kind: selected.type, plate: selected.plate })
      .then(setDetections)
      .catch(() => setDetections([]))
      .finally(() => setLoading(false));
  }, [selected]);

  const mapPoints = useMemo(
    () => (mapDetIndex !== null && detections[mapDetIndex] ? toMapPoints([detections[mapDetIndex]]) : []),
    [mapDetIndex, detections]
  );

  const openMap = useCallback((index: number) => {
    setMapDetIndex(index);
  }, []);

  const openVideo = useCallback((index: number) => {
    setVideoDetIndex(index);
    setVideoOpen(true);
  }, []);

  const handleMainClose = (open: boolean) => {
    if (!open) {
      onClose();
      setMapDetIndex(null);
    }
  };

  return (
    <>
      <Dialog open={!!selected} onOpenChange={handleMainClose}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selected?.type === 'face' ? (
                <Icon name="User" size={22} className="text-secondary" />
              ) : (
                <Icon name="Hash" size={22} className="text-primary" />
              )}
              {selected?.type === 'face' ? 'Распознавание лица' : 'Распознавание ГРЗ'}
              <Badge className="ml-2 text-sm px-3 py-1" variant="secondary">
                {detections.length} совпадений
              </Badge>
              <DialogClose asChild className="ml-auto">
                <Button size="icon" variant="secondary" title="Закрыть">
                  <Icon name="X" size={18} />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col flex-1 overflow-hidden gap-4 mt-2">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Найдено совпадений: {detections.length}
              </p>

              {mapDetIndex !== null && (
                <div className="rounded-xl overflow-hidden border" style={{ height: 220 }}>
                  {mapPoints.length > 0 ? (
                    <YandexMap points={mapPoints} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      У камеры не указаны координаты
                    </div>
                  )}
                </div>
              )}

              {detections.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <Icon name="Search" size={40} className="mx-auto mb-3 opacity-50" />
                  <p>{loading ? 'Загрузка...' : 'Совпадений в базе не найдено'}</p>
                </div>
              )}
              <ScrollArea className="flex-1 pr-2">
                <div className="flex flex-col gap-4">
                  {detections.map((det, index) => (
                    <div key={det.id} className="flex gap-4 items-start border border-border rounded-xl p-4">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Искомое</p>
                        {selected.plate ? (
                          <div className="relative w-40 h-52 rounded-lg overflow-hidden bg-muted flex flex-col items-center justify-center gap-2 border-2 border-border">
                            <div className="bg-white border-2 border-black rounded px-3 py-1 font-mono font-bold text-lg tracking-widest text-black">
                              {selected.plate}
                            </div>
                            <p className="text-xs text-muted-foreground">ГРЗ</p>
                          </div>
                        ) : (
                          <div className="relative w-40 h-52 rounded-lg overflow-hidden bg-muted">
                            {selected.image ? (
                              <img src={selected.image} alt="Искомое изображение" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="User" size={40} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Найдено</p>
                        <button
                          type="button"
                          onClick={() => setPhotoDetIndex(index)}
                          className="relative w-40 h-52 rounded-lg overflow-hidden bg-muted cursor-zoom-in"
                        >
                          {(det.type === 'plate' ? (det.carImage ?? det.image) : det.image) ? (
                            <DetectionPhotoCanvas
                              src={(det.type === 'plate' ? (det.carImage ?? det.image) : det.image) as string}
                              lines={[det.time, det.camera, det.address]}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="User" size={40} className="text-muted-foreground" />
                            </div>
                          )}
                          <Badge
                            className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0"
                            variant={det.match > 92 ? 'default' : 'secondary'}
                          >
                            {det.match}%
                          </Badge>
                        </button>
                      </div>
                      <div className="space-y-1.5 flex-1 py-1">
                        <p className="font-semibold text-sm">{det.camera}</p>
                        <p className="text-xs text-muted-foreground">{det.address}</p>
                        <p className="text-xs text-muted-foreground">{det.time}</p>
                        <div className="flex gap-1 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => openMap(index)}
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

              {selected.plate && (
                <div className="border-t pt-4">
                  <span className="text-sm text-muted-foreground">Государственный регистрационный знак</span>
                  <p className="font-medium font-mono text-2xl mt-1">{selected.plate}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecognitionVideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        items={detections}
        index={videoDetIndex}
        onIndexChange={setVideoDetIndex}
      />

      {/* Диалог просмотра фото */}
      <Dialog open={photoDetIndex !== null} onOpenChange={open => !open && setPhotoDetIndex(null)}>
        <DialogContent className="max-w-lg flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Image" size={18} />
              {photoDetIndex !== null && detections[photoDetIndex]?.camera}
              <DialogClose asChild className="ml-auto">
                <Button size="icon" variant="secondary" title="Закрыть">
                  <Icon name="X" size={18} />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          {photoDetIndex !== null && detections[photoDetIndex] && (
            <div className="flex flex-col gap-2">
              <div className="rounded-lg overflow-hidden bg-muted">
                <img
                  src={(detections[photoDetIndex].type === 'plate' ? (detections[photoDetIndex].carImage ?? detections[photoDetIndex].image) : detections[photoDetIndex].image) as string}
                  alt={detections[photoDetIndex].camera}
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{detections[photoDetIndex].camera}</p>
                <p className="text-xs text-muted-foreground">
                  {detections[photoDetIndex].address} · {detections[photoDetIndex].time}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};