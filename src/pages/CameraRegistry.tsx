import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_CAMERAS = 'https://functions.poehali.dev/a2915cca-0478-407a-8a11-b2f1ed8d3b0e';
const API_MODELS = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';
const API_GROUPS = 'https://functions.poehali.dev/82081c1b-ac10-4aa3-aaa8-a7cc4a6fad84';

interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  owner: string;
  address: string;
  latitude?: number;
  longitude?: number;
  territorial_division: string;
  status: string;
  manufacturer?: string;
  model_name?: string;
  created_at: string;
}

interface CameraModel {
  id: number;
  manufacturer: string;
  model_name: string;
  supports_ptz: boolean;
}

interface CameraGroup {
  id: number;
  name: string;
  camera_count: number;
}

const CameraRegistry = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [models, setModels] = useState<CameraModel[]>([]);
  const [groups, setGroups] = useState<CameraGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    rtsp_url: '',
    rtsp_login: '',
    rtsp_password: '',
    model_id: '',
    owner: '',
    address: '',
    latitude: '',
    longitude: '',
    territorial_division: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [camerasRes, modelsRes, groupsRes] = await Promise.all([
        fetch(API_CAMERAS),
        fetch(API_MODELS),
        fetch(API_GROUPS),
      ]);

      const camerasData = await camerasRes.json();
      const modelsData = await modelsRes.json();
      const groupsData = await groupsRes.json();

      setCameras(camerasData);
      setModels(modelsData);
      setGroups(groupsData);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки данных',
        description: 'Не удалось загрузить данные камер',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(API_CAMERAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          model_id: formData.model_id ? parseInt(formData.model_id) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Камера добавлена',
          description: 'Новая камера успешно добавлена в реестр',
        });
        setIsDialogOpen(false);
        setFormData({
          name: '',
          rtsp_url: '',
          rtsp_login: '',
          rtsp_password: '',
          model_id: '',
          owner: '',
          address: '',
          latitude: '',
          longitude: '',
          territorial_division: '',
          status: 'active',
        });
        loadData();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось добавить камеру',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить камеру',
        variant: 'destructive',
      });
    }
  };

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Реестр камер</h1>
          <p className="text-muted-foreground">Управление камерами видеонаблюдения</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить камеру
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая камера</DialogTitle>
              <DialogDescription>
                Заполните информацию о камере для добавления в реестр
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активна</SelectItem>
                      <SelectItem value="inactive">Неактивна</SelectItem>
                      <SelectItem value="maintenance">На обслуживании</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rtsp_url">RTSP URL *</Label>
                <Input
                  id="rtsp_url"
                  value={formData.rtsp_url}
                  onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
                  placeholder="rtsp://user:pass@192.168.1.10:554/stream"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rtsp_login">RTSP логин</Label>
                  <Input
                    id="rtsp_login"
                    value={formData.rtsp_login}
                    onChange={(e) => setFormData({ ...formData, rtsp_login: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rtsp_password">RTSP пароль</Label>
                  <Input
                    id="rtsp_password"
                    type="password"
                    value={formData.rtsp_password}
                    onChange={(e) =>
                      setFormData({ ...formData, rtsp_password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_id">Модель камеры</Label>
                <Select
                  value={formData.model_id}
                  onValueChange={(value) => setFormData({ ...formData, model_id: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Собственник</Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territorial_division">Территориальное подразделение</Label>
                  <Input
                    id="territorial_division"
                    value={formData.territorial_division}
                    onChange={(e) =>
                      setFormData({ ...formData, territorial_division: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Широта</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="58.0105"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Долгота</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="56.2502"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, адресу или собственнику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>Собственник</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Территория</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCameras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Камеры не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredCameras.map((camera) => (
                <TableRow key={camera.id}>
                  <TableCell className="font-medium">{camera.name}</TableCell>
                  <TableCell>
                    {camera.manufacturer && camera.model_name
                      ? `${camera.manufacturer} ${camera.model_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>{camera.owner || '-'}</TableCell>
                  <TableCell>{camera.address || '-'}</TableCell>
                  <TableCell>{camera.territorial_division || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        camera.status === 'active'
                          ? 'default'
                          : camera.status === 'inactive'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {camera.status === 'active'
                        ? 'Активна'
                        : camera.status === 'inactive'
                        ? 'Неактивна'
                        : 'Обслуживание'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Icon name="Eye" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего камер</p>
              <p className="text-2xl font-bold">{cameras.length}</p>
            </div>
            <Icon name="Camera" className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Активных</p>
              <p className="text-2xl font-bold">
                {cameras.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Моделей</p>
              <p className="text-2xl font-bold">{models.length}</p>
            </div>
            <Icon name="Package" className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraRegistry;
