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

const CameraVideoDialog = ({
  camera,
  open,
  onOpenChange,
  onOpenSettings,
  getStatusColor,
  getStatusLabel,
}: CameraVideoDialogProps) => {
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
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
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

            <div className="flex items-center gap-2">
              <Button className="flex-1">
                <Icon name="Archive" size={18} className="mr-2" />
                Видеоархив
              </Button>
              <Button variant="outline" className="flex-1">
                <Icon name="Download" size={18} className="mr-2" />
                Скачать фрагмент
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraVideoDialog;
