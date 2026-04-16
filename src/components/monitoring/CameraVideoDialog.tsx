import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera } from '@/lib/api';

interface CameraVideoDialogProps {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onOpenSettings: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

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
}: CameraVideoDialogProps) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [ptzVisible, setPtzVisible] = useState(false);

  const handleFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => toast.error('Не удалось открыть полноэкранный режим'));
    } else {
      document.exitFullscreen();
    }
  };

  const handlePTZCommand = (cmd: string) => {
    toast.info(`PTZ: ${cmd}`, { duration: 800 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
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
            </div>
          </DialogTitle>
        </DialogHeader>

        {camera && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div ref={videoContainerRef} className="flex-1 aspect-video bg-black rounded-lg overflow-hidden relative">
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
              <Button variant="outline" className="flex-1" onClick={handleFullscreen}>
                <Icon name="Maximize" size={18} className="mr-2" />
                На весь экран
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraVideoDialog;
