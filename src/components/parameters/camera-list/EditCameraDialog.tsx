import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Camera, CameraModel, Owner, TerritorialDivision } from './CameraListTypes';
import { useState } from 'react';

interface EditCameraDialogProps {
  open: boolean;
  camera: Camera | null;
  formData: {
    name: string;
    rtsp_url: string;
    rtsp_login: string;
    rtsp_password: string;
    model_id: string;
    ptz_ip?: string;
    ptz_port?: string;
    ptz_login?: string;
    ptz_password?: string;
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
  camera,
  formData,
  models,
  owners,
  divisions,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: EditCameraDialogProps) => {
  const [ownerSearch, setOwnerSearch] = useState('');
  const [divisionSearch, setDivisionSearch] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать камеру</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Название камеры <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>RTSP URL <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={formData.rtsp_url}
              onChange={(e) => onFormDataChange({ ...formData, rtsp_url: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин RTSP</Label>
              <Input
                type="text"
                value={formData.rtsp_login}
                onChange={(e) => onFormDataChange({ ...formData, rtsp_login: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Пароль RTSP</Label>
              <Input
                type="password"
                value={formData.rtsp_password}
                onChange={(e) => onFormDataChange({ ...formData, rtsp_password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Модель камеры</Label>
            <Select value={formData.model_id} onValueChange={(value) => onFormDataChange({ ...formData, model_id: value })}>
              <SelectTrigger className="[&>span]:block [&>span]:truncate [&>span]:text-foreground">
                <SelectValue placeholder="Выберите модель">
                  {formData.model_id && models.find(m => m.id.toString() === formData.model_id)
                    ? `${models.find(m => m.id.toString() === formData.model_id)?.manufacturer} ${models.find(m => m.id.toString() === formData.model_id)?.model_name}`
                    : 'Выберите модель'}
                </SelectValue>
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

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">PTZ управление (опционально)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP адрес PTZ</Label>
                <Input
                  type="text"
                  placeholder="192.168.1.100"
                  value={formData.ptz_ip || ''}
                  onChange={(e) => onFormDataChange({ ...formData, ptz_ip: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Порт PTZ</Label>
                <Input
                  type="text"
                  placeholder="80"
                  value={formData.ptz_port || ''}
                  onChange={(e) => onFormDataChange({ ...formData, ptz_port: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Логин PTZ</Label>
                <Input
                  type="text"
                  placeholder="Введите логин"
                  value={formData.ptz_login || ''}
                  onChange={(e) => onFormDataChange({ ...formData, ptz_login: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Пароль PTZ</Label>
                <Input
                  type="text"
                  placeholder="Введите пароль"
                  value={formData.ptz_password || ''}
                  onChange={(e) => onFormDataChange({ ...formData, ptz_password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Собственник камеры <span className="text-red-500">*</span></Label>
            <Select value={formData.owner} onValueChange={(value) => onFormDataChange({ ...formData, owner: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите собственника" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 sticky top-0 bg-background border-b">
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск собственника..."
                      value={ownerSearch}
                      onChange={(e) => setOwnerSearch(e.target.value)}
                      className="pl-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {owners
                    .filter(owner => owner.name.toLowerCase().includes(ownerSearch.toLowerCase()))
                    .map((owner) => (
                      <SelectItem key={owner.id} value={owner.name}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  {owners.filter(owner => owner.name.toLowerCase().includes(ownerSearch.toLowerCase())).length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Не найдено
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Глубина хранения видеоархива (дней) <span className="text-red-500">*</span></Label>
            <Select value={formData.archive_depth_days} onValueChange={(value) => onFormDataChange({ ...formData, archive_depth_days: value })} required>
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

          <div className="space-y-2">
            <Label>Территориальное деление <span className="text-red-500">*</span></Label>
            <Select value={formData.territorial_division} onValueChange={(value) => onFormDataChange({ ...formData, territorial_division: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите территорию" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 sticky top-0 bg-background border-b">
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск территории..."
                      value={divisionSearch}
                      onChange={(e) => setDivisionSearch(e.target.value)}
                      className="pl-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {divisions
                    .filter(division => division.name.toLowerCase().includes(divisionSearch.toLowerCase()))
                    .map((division) => (
                      <SelectItem key={division.id} value={division.name}>
                        {division.name}
                      </SelectItem>
                    ))}
                  {divisions.filter(division => division.name.toLowerCase().includes(divisionSearch.toLowerCase())).length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Не найдено
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Адрес местоположения <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Широта <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={formData.latitude}
                onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Долгота <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={formData.longitude}
                onChange={(e) => onFormDataChange({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};