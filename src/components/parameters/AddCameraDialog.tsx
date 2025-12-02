import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AddCameraDialogProps {
  onSuccess: () => void;
}

interface CameraModel {
  id: number;
  manufacturer: string;
  model_name: string;
}

interface Owner {
  id: number;
  name: string;
}

interface TerritorialDivision {
  id: number;
  name: string;
}

const CAMERAS_API = 'https://functions.poehali.dev/712d5c60-998d-49d9-8252-705500df28c7';
const MODELS_API = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';
const OWNERS_API = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';
const DIVISIONS_API = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';

export const AddCameraDialog = ({ onSuccess }: AddCameraDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<CameraModel[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<TerritorialDivision[]>([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [divisionSearch, setDivisionSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    rtsp_url: '',
    rtsp_login: '',
    rtsp_password: '',
    model_id: '',
    ptz_ip: '',
    ptz_port: '',
    ptz_login: '',
    ptz_password: '',
    owner: '',
    address: '',
    latitude: '',
    longitude: '',
    territorial_division: '',
    archive_depth_days: '30',
  });

  useEffect(() => {
    if (open) {
      fetchModels();
      fetchOwners();
      fetchDivisions();
    }
  }, [open]);

  const fetchModels = async () => {
    try {
      const response = await fetch(MODELS_API);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await fetch(OWNERS_API);
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch(DIVISIONS_API);
      if (response.ok) {
        const data = await response.json();
        setDivisions(data);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.rtsp_url.trim()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        model_id: formData.model_id ? parseInt(formData.model_id) : null,
        ptz_port: formData.ptz_port ? parseInt(formData.ptz_port) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        archive_depth_days: parseInt(formData.archive_depth_days),
        status: 'active',
      };

      const response = await fetch(CAMERAS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create camera');

      toast.success('Камера успешно добавлена');
      setOpen(false);
      setFormData({
        name: '',
        rtsp_url: '',
        rtsp_login: '',
        rtsp_password: '',
        model_id: '',
        ptz_ip: '',
        ptz_port: '',
        ptz_login: '',
        ptz_password: '',
        owner: '',
        address: '',
        latitude: '',
        longitude: '',
        territorial_division: '',
        archive_depth_days: '30',
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating camera:', error);
      toast.error('Ошибка создания камеры');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить камеру
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новую камеру видеонаблюдения</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Название камеры <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Камера-001"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>RTSP ссылка на видеопоток <span className="text-red-500">*</span></Label>
            <Input
              placeholder="rtsp://username:password@ip:port/stream"
              className="font-mono text-sm"
              value={formData.rtsp_url}
              onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин RTSP</Label>
              <Input
                placeholder="Введите логин"
                value={formData.rtsp_login}
                onChange={(e) => setFormData({ ...formData, rtsp_login: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Пароль RTSP</Label>
              <Input
                placeholder="Введите пароль"
                value={formData.rtsp_password}
                onChange={(e) => setFormData({ ...formData, rtsp_password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Марка и модель камеры</Label>
            <Select value={formData.model_id} onValueChange={(value) => setFormData({ ...formData, model_id: value })}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IP адрес PTZ</Label>
              <Input
                placeholder="192.168.1.10"
                value={formData.ptz_ip}
                onChange={(e) => setFormData({ ...formData, ptz_ip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Порт PTZ</Label>
              <Input
                placeholder="8000"
                value={formData.ptz_port}
                onChange={(e) => setFormData({ ...formData, ptz_port: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин PTZ</Label>
              <Input
                placeholder="Введите логин"
                value={formData.ptz_login}
                onChange={(e) => setFormData({ ...formData, ptz_login: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Пароль PTZ</Label>
              <Input
                type="text"
                placeholder="Введите пароль"
                value={formData.ptz_password}
                onChange={(e) => setFormData({ ...formData, ptz_password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Собственник камеры <span className="text-red-500">*</span></Label>
            <Select value={formData.owner} onValueChange={(value) => setFormData({ ...formData, owner: value })} required>
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
            <Select value={formData.archive_depth_days} onValueChange={(value) => setFormData({ ...formData, archive_depth_days: value })} required>
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
            <Select value={formData.territorial_division} onValueChange={(value) => setFormData({ ...formData, territorial_division: value })} required>
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
              placeholder="Введите адрес"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Широта <span className="text-red-500">*</span></Label>
              <Input
                placeholder="58.0105"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Долгота <span className="text-red-500">*</span></Label>
              <Input
                placeholder="56.2502"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Карта местоположения</Label>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Переместите маркер для указания местоположения
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить камеру'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};