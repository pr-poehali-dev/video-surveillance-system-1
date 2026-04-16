import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Camera } from '@/lib/api';

interface CameraSettingsSheetProps {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

const CameraSettingsSheet = ({ camera, open, onOpenChange }: CameraSettingsSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Параметры камеры</SheetTitle>
          <SheetDescription>{camera?.name}</SheetDescription>
        </SheetHeader>
        {camera && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Разрешение</span>
              <span className="font-medium">{camera.resolution}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Трафик (онлайн)</span>
              <span className="font-medium">{camera.traffic} Мбит/с</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Трафик (за 1 минуту)</span>
              <span className="font-medium">{(camera.traffic * 60).toFixed(1)} Мбит/мин</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Трафик (максимальный)</span>
              <span className="font-medium">{(camera.traffic * 1.5).toFixed(1)} Мбит/с</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Кол-во кадров (онлайн)</span>
              <span className="font-medium">{camera.fps} кадр/мин</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Кол-во кадров (за 1 минуту)</span>
              <span className="font-medium">{camera.fps * 60} кадров/мин</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Максимальное кол-во кадров</span>
              <span className="font-medium">{camera.fps * 2} кадр/мин</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CameraSettingsSheet;