import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera } from '@/lib/api';
import { DetectionSettings } from '@/components/monitoring/CameraSettingsSheet';

interface CameraVideoDialogProps {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenSettings: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  detectionSettings: DetectionSettings;
}

const MOCK_DETECTIONS = {
  face: [
    { x: '12%', y: '20%', w: '14%', h: '22%', label: 'Лицо 94%' },
    { x: '62%', y: '30%', w: '12%', h: '20%', label: 'Лицо 87%' },
  ],
  plate: [
    { x: '35%', y: '65%', w: '22%', h: '10%', label: 'А123ВС159' },
  ],
  car: [
    { x: '28%', y: '50%', w: '30%', h: '35%', label: 'Авто 98%' },
    { x: '70%', y: '55%', w: '22%', h: '28%', label: 'Авто 91%' },
  ],
};

const PTZControl = ({ onCommand }: { onCommand: (cmd: string) => void }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="text-xs text-muted-foreground mb-1 font-medium">Управление PTZ</div>
    <div className="grid grid-cols-3 gap-1">
      <div />
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('up')} onMouseUp={() => onCommand('stop')} title="Вверх">
        <Icon name="ChevronUp" size={16} />
      </Button>
      <div />
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('left')} onMouseUp={() => onCommand('stop')} title="Влево">
        <Icon name="ChevronLeft" size={16} />
      </Button>
      <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => onCommand('home')} title="Центр">
        <Icon name="Crosshair" size={14} />
      </Button>
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('right')} onMouseUp={() => onCommand('stop')} title="Вправо">
        <Icon name="ChevronRight" size={16} />
      </Button>
      <div />
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('down')} onMouseUp={() => onCommand('stop')} title="Вниз">
        <Icon name="ChevronDown" size={16} />
      </Button>
      <div />
    </div>
    <div className="flex gap-1 mt-1">
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('zoom_in')} onMouseUp={() => onCommand('stop')} title="Зум +">
        <Icon name="ZoomIn" size={14} />
      </Button>
      <Button size="icon" variant="outline" className="w-8 h-8" onMouseDown={() => onCommand('zoom_out')} onMouseUp={() => onCommand('stop')} title="Зум -">
        <Icon name="ZoomOut" size={14} />
      </Button>
    </div>
  </div>
);

const CameraVideoDialog = ({
  camera,
  open,
  onOpenChange,
  onOpenSettings,
  getStatusColor,
  getStatusLabel,
  detectionSettings,
}: CameraVideoDialogProps) => {
  const hasDetection = detectionSettings.faceDetection || detectionSettings.plateDetection || detectionSettings.carDetection;
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [ptzVisible, setPtzVisible] = useState(false);
  const [isDialogFullscreen, setIsDialogFullscreen] = useState(false);

  const handleFullscreen = () => {
    const el = dialogContentRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => toast.error('Не удалось открыть полноэкранный режим'));
      setIsDialogFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsDialogFullscreen(false);
    }
  };

  const handlePTZCommand = (cmd: string) => {
    toast.info(`PTZ: ${cmd}`, { duration: 800 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogContentRef} className={`max-w-4xl flex flex-col transition-all ${isDialogFullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none' : 'h-[90vh]'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Video" size={20} />
            <div className="flex flex-col">
              <span>{camera?.name}</span>
              {camera?.address && (
                <span className="text-sm font-normal text-muted-foreground">{camera.address}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mx-auto">
              <div className={`w-3 h-3 ${getStatusColor(camera?.status)} rounded-full`} />
              <span className="text-sm font-normal">{getStatusLabel(camera?.status)}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button size="icon" variant="secondary" title="Распознать лица">
                <Icon name="ScanFace" size={18} />
              </Button>
              <Button size="icon" variant="secondary" title="Распознать ГРЗ">
                <Icon name="CarFront" size={18} />
              </Button>
              <Button size="icon" variant="secondary" title="Настройки" onClick={onOpenSettings}>
                <Icon name="Settings" size={18} />
              </Button>
              <DialogClose asChild>
                <Button size="icon" variant="secondary" title="Закрыть">
                  <Icon name="X" size={18} />
                </Button>
              </DialogClose>
            </div>
          </DialogTitle>
        </DialogHeader>

        {camera && (
          <div className="flex flex-col flex-1 space-y-4 overflow-hidden">
            <div className="flex gap-3 flex-1 min-h-0">
              <div ref={videoContainerRef} className="flex-1 bg-black rounded-lg overflow-hidden relative">
                {camera.hls_url ? (
                  <video
                    key={camera.hls_url}
                    src={camera.hls_url}
                    autoPlay
                    controls
                    muted
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLVideoElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ display: camera.hls_url ? 'none' : 'flex' }}
                >
                  {camera.rtsp_url ? (
                    <div className="text-center px-6">
                      <Icon name="Video" size={48} className="text-white/60 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">RTSP-поток</p>
                      <p className="text-white/50 text-xs mb-3 font-mono break-all">{camera.rtsp_url}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white/30 hover:bg-white/10"
                        onClick={() => {
                          navigator.clipboard.writeText(camera.rtsp_url!);
                          toast.success('Ссылка скопирована');
                        }}
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Скопировать ссылку
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="VideoOff" size={48} className="text-white/40 mx-auto mb-2" />
                      <p className="text-white/60">Поток не настроен</p>
                      <p className="text-white/40 text-sm">{camera.resolution} • {camera.fps} FPS</p>
                    </div>
                  )}
                </div>

                {hasDetection && (
                  <div className="absolute inset-0 pointer-events-none">
                    {detectionSettings.faceDetection && MOCK_DETECTIONS.face.map((box, i) => (
                      <div
                        key={`face-${i}`}
                        className="absolute border-2 border-blue-400"
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                      >
                        <span className="absolute -top-5 left-0 text-xs bg-blue-500 text-white px-1 rounded whitespace-nowrap">{box.label}</span>
                      </div>
                    ))}
                    {detectionSettings.plateDetection && MOCK_DETECTIONS.plate.map((box, i) => (
                      <div
                        key={`plate-${i}`}
                        className="absolute border-2 border-yellow-400"
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                      >
                        <span className="absolute -top-5 left-0 text-xs bg-yellow-500 text-black px-1 rounded whitespace-nowrap">{box.label}</span>
                      </div>
                    ))}
                    {detectionSettings.carDetection && MOCK_DETECTIONS.car.map((box, i) => (
                      <div
                        key={`car-${i}`}
                        className="absolute border-2 border-green-400"
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                      >
                        <span className="absolute -top-5 left-0 text-xs bg-green-500 text-white px-1 rounded whitespace-nowrap">{box.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ptzVisible && (
                <div className="flex-shrink-0 flex items-center justify-center border rounded-lg p-3 bg-muted/30">
                  <PTZControl onCommand={handlePTZCommand} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button className="flex-1">
                <Icon name="Archive" size={18} className="mr-2" />
                Видеоархив
              </Button>
              <Button variant="outline" className="flex-1">
                <Icon name="Download" size={18} className="mr-2" />
                Скачать фрагмент
              </Button>
              <Button
                variant={ptzVisible ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={() => setPtzVisible(!ptzVisible)}
              >
                <Icon name="Gamepad2" size={18} className="mr-2" />
                Управление PTZ
              </Button>
              <Button variant={isDialogFullscreen ? 'secondary' : 'outline'} className="flex-1" onClick={handleFullscreen}>
                <Icon name={isDialogFullscreen ? 'Minimize' : 'Maximize'} size={18} className="mr-2" />
                {isDialogFullscreen ? 'Свернуть' : 'На весь экран'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraVideoDialog;