import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { SearchResult } from './SearchResultCard';
import { DetectionPhotoCanvas } from './DetectionPhotoCanvas';

const QUERY_IMAGE = 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/524d6d4a-6e05-4af7-996f-d87c2459dbad.jpg';

export const MOCK_DETECTIONS = [
  { lat: 56.8389, lng: 60.6057, label: 'Камера-001', time: '2024-11-21 14:32:15', address: 'ул. Ленина, 50', match: 94.5, image: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/0c2b6527-0396-4237-ab0c-6b209663943f.jpg', carImage: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/a0d8be6e-397a-421b-8f16-fa3c30e06d01.jpg' },
  { lat: 56.8412, lng: 60.6124, label: 'Камера-003', time: '2024-11-21 14:45:02', address: 'пр. Мира, 12', match: 88.2, image: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/056646e7-d699-41c0-8f5f-2a3938add3c9.jpg', carImage: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/75140210-ae2e-4d2a-b792-3b5b51dcfc28.jpg' },
  { lat: 56.8350, lng: 60.5990, label: 'Камера-007', time: '2024-11-21 15:01:38', address: 'ул. Пушкина, 3', match: 91.7, image: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/9b60b084-220b-416a-9c90-4372a35f00a8.jpg', carImage: 'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/e8e4d5fd-b307-4ed0-98e4-2dbbe113b5d9.jpg' },
];

interface DetectionsDialogProps {
  selected: SearchResult | null;
  onClose: () => void;
}

export const DetectionsDialog = ({ selected, onClose }: DetectionsDialogProps) => {
  const [mapDetIndex, setMapDetIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoDetIndex, setVideoDetIndex] = useState(0);
  const [photoDetIndex, setPhotoDetIndex] = useState<number | null>(null);

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
                {MOCK_DETECTIONS.length} совпадений
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
                Найдено совпадений: {MOCK_DETECTIONS.length}
              </p>

              {mapDetIndex !== null && (
                <div className="rounded-xl overflow-hidden border" style={{ height: 220 }}>
                  <YandexMap
                    cameras={MOCK_DETECTIONS.map((d, i) => ({ id: i, lat: d.lat, lng: d.lng, name: d.label, address: d.address, status: 'online' as const }))}
                    selectedCamera={mapDetIndex}
                    onCameraSelect={() => {}}
                  />
                </div>
              )}

              <ScrollArea className="flex-1 pr-2">
                <div className="flex flex-col gap-4">
                  {MOCK_DETECTIONS.map((det, index) => (
                    <div key={index} className="flex gap-4 items-start border border-border rounded-xl p-4">
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
                            <img src={QUERY_IMAGE} alt="Искомое изображение" className="w-full h-full object-cover" />
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
                          {det.image ? (
                            <DetectionPhotoCanvas
                              src={det.image}
                              lines={[det.time, det.label, det.address]}
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
                        <p className="font-semibold text-sm">{det.label}</p>
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

      {/* Диалог видео */}
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

      {/* Диалог просмотра фото */}
      <Dialog open={photoDetIndex !== null} onOpenChange={open => !open && setPhotoDetIndex(null)}>
        <DialogContent className="max-w-lg flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Image" size={18} />
              {photoDetIndex !== null && MOCK_DETECTIONS[photoDetIndex]?.label}
              <DialogClose asChild className="ml-auto">
                <Button size="icon" variant="secondary" title="Закрыть">
                  <Icon name="X" size={18} />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          {photoDetIndex !== null && (
            <div className="flex flex-col gap-2">
              <div className="rounded-lg overflow-hidden bg-muted">
                <DetectionPhotoCanvas
                  src={MOCK_DETECTIONS[photoDetIndex].image}
                  lines={[MOCK_DETECTIONS[photoDetIndex].time, MOCK_DETECTIONS[photoDetIndex].label, MOCK_DETECTIONS[photoDetIndex].address]}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {MOCK_DETECTIONS[photoDetIndex].address} · {MOCK_DETECTIONS[photoDetIndex].time}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};