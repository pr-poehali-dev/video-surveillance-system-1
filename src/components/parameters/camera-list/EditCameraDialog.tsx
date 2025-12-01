import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, CameraModel, Owner, TerritorialDivision } from './CameraListTypes';

interface EditCameraDialogProps {
  open: boolean;
  camera: Camera | null;
  formData: {
    name: string;
    rtsp_url: string;
    rtsp_login: string;
    rtsp_password: string;
    model_id: string;
    owner: string;
    address: string;
    latitude: string;
    longitude: string;
    territorial_division: string;
    archive_depth_days: string;
  };
  models: CameraModel[];
  owners: Owner[];
  divisions: TerritorialDivision[];
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (formData: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditCameraDialog = ({
  open,
  formData,
  models,
  owners,
  divisions,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: EditCameraDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать камеру видеонаблюдения</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Название камеры <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              RTSP ссылка <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.rtsp_url}
              onChange={(e) => onFormDataChange({ ...formData, rtsp_url: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин RTSP</Label>
              <Input
                value={formData.rtsp_login}
                onChange={(e) => onFormDataChange({ ...formData, rtsp_login: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Пароль RTSP</Label>
              <Input
                value={formData.rtsp_password}
                onChange={(e) => onFormDataChange({ ...formData, rtsp_password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Модель камеры</Label>
            <Select
              value={formData.model_id}
              onValueChange={(value) => onFormDataChange({ ...formData, model_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.manufacturer} {model.model_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Собственник <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.owner}
              onValueChange={(value) => onFormDataChange({ ...formData, owner: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите собственника" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.name}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Территориальное деление <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.territorial_division}
              onValueChange={(value) => onFormDataChange({ ...formData, territorial_division: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите территорию" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.name}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Адрес <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Широта</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Долгота</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => onFormDataChange({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Архив (дней) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.archive_depth_days}
              onValueChange={(value) => onFormDataChange({ ...formData, archive_depth_days: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="14">14 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="60">60 дней</SelectItem>
                <SelectItem value="90">90 дней</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
