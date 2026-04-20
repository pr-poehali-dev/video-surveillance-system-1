import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Camera } from '@/lib/api';

interface DetectionSettings {
  faceDetection: boolean;
  plateDetection: boolean;
  carDetection: boolean;
}

interface CameraSettingsSheetProps {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  detectionSettings: DetectionSettings;
  onDetectionChange: (key: keyof DetectionSettings, value: boolean) => void;
}

const CameraSettingsSheet = ({
  camera,
  open,
  onOpenChange,
  detectionSettings,
  onDetectionChange,
}: CameraSettingsSheetProps) => {
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

            <div className="pt-2">
              <p className="text-sm font-semibold mb-3">Нейросетевая детекция</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="face-detection"
                    checked={detectionSettings.faceDetection}
                    onCheckedChange={(v) => onDetectionChange('faceDetection', !!v)}
                  />
                  <Label htmlFor="face-detection" className="cursor-pointer">Распознавание лиц</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="plate-detection"
                    checked={detectionSettings.plateDetection}
                    onCheckedChange={(v) => onDetectionChange('plateDetection', !!v)}
                  />
                  <Label htmlFor="plate-detection" className="cursor-pointer">Распознавание номеров (ГРЗ)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="car-detection"
                    checked={detectionSettings.carDetection}
                    onCheckedChange={(v) => onDetectionChange('carDetection', !!v)}
                  />
                  <Label htmlFor="car-detection" className="cursor-pointer">Детекция автомобилей</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export { type DetectionSettings };
export default CameraSettingsSheet;
