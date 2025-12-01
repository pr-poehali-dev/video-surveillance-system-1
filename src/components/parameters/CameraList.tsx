import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  rtsp_login?: string;
  rtsp_password?: string;
  model_id?: number;
  manufacturer?: string;
  model_name?: string;
  owner: string;
  address: string;
  latitude?: number;
  longitude?: number;
  territorial_division: string;
  archive_depth_days: number;
  status: string;
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

const CAMERAS_API = 'https://functions.poehali.dev/dab3e8e4-48b1-43e8-bcfa-a4e01a88a3ca';
const MODELS_API = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';
const OWNERS_API = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';
const DIVISIONS_API = 'https://functions.poehali.dev/d5a6cdfb-9846-4e82-a073-4a9fe43fe2a8';

interface CameraListProps {
  refreshTrigger?: number;
}

export const CameraList = ({ refreshTrigger }: CameraListProps) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cameraToEdit, setCameraToEdit] = useState<Camera | null>(null);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [models, setModels] = useState<CameraModel[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<TerritorialDivision[]>([]);

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
    archive_depth_days: '30',
  });

  useEffect(() => {
    fetchCameras();
    fetchModels();
    fetchOwners();
    fetchDivisions();
  }, [refreshTrigger]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch(CAMERAS_API);
      if (!response.ok) throw new Error('Failed to fetch cameras');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error('Ошибка загрузки камер');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (camera: Camera) => {
    setCameraToEdit(camera);
    setFormData({
      name: camera.name,
      rtsp_url: camera.rtsp_url,
      rtsp_login: camera.rtsp_login || '',
      rtsp_password: camera.rtsp_password || '',
      model_id: camera.model_id?.toString() || '',
      owner: camera.owner || '',
      address: camera.address || '',
      latitude: camera.latitude?.toString() || '',
      longitude: camera.longitude?.toString() || '',
      territorial_division: camera.territorial_division || '',
      archive_depth_days: camera.archive_depth_days?.toString() || '30',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraToEdit) return;

    try {
      const payload = {
        id: cameraToEdit.id,
        ...formData,
        model_id: formData.model_id ? parseInt(formData.model_id) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        archive_depth_days: parseInt(formData.archive_depth_days),
      };

      const response = await fetch(CAMERAS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update camera');

      toast.success('Камера обновлена');
      setIsEditDialogOpen(false);
      fetchCameras();
    } catch (error) {
      console.error('Error updating camera:', error);
      toast.error('Ошибка обновления камеры');
    }
  };

  const handleDelete = async () => {
    if (!cameraToDelete) return;

    try {
      const response = await fetch(CAMERAS_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cameraToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete camera');

      toast.success('Камера удалена');
      setIsDeleteDialogOpen(false);
      fetchCameras();
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast.error('Ошибка удаления камеры');
    }
  };

  const filteredCameras = cameras.filter((camera) => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address?.toLowerCase().includes(query) ||
      camera.owner?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск по названию, адресу, собственнику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          {filteredCameras.map((camera) => (
            <Card key={camera.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Camera" size={20} className="text-primary" />
                    <h3 className="font-semibold">{camera.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={camera.status === 'active' ? 'default' : 'secondary'}>
                      {camera.status === 'active' ? 'Активна' : 'Неактивна'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(camera)}>
                      <Icon name="Pencil" size={16} className="mr-2" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCameraToDelete(camera);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Адрес:</span>
                    <p className="font-medium">{camera.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Модель:</span>
                    <p className="font-medium">
                      {camera.manufacturer && camera.model_name
                        ? `${camera.manufacturer} ${camera.model_name}`
                        : 'Не указана'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Собственник:</span>
                    <p className="font-medium">{camera.owner || 'Не указан'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Архив:</span>
                    <p className="font-medium">{camera.archive_depth_days || 30} дней</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCameras.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Camera" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Камеры не найдены</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать камеру видеонаблюдения</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Название камеры <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                RTSP ссылка <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.rtsp_url}
                onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Логин RTSP</Label>
                <Input
                  value={formData.rtsp_login}
                  onChange={(e) => setFormData({ ...formData, rtsp_login: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Пароль RTSP</Label>
                <Input
                  value={formData.rtsp_password}
                  onChange={(e) => setFormData({ ...formData, rtsp_password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Модель камеры</Label>
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

            <div className="space-y-2">
              <Label>
                Собственник <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.owner}
                onValueChange={(value) => setFormData({ ...formData, owner: value })}
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
                onValueChange={(value) => setFormData({ ...formData, territorial_division: value })}
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
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Долгота</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Архив (дней) <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.archive_depth_days}
                onValueChange={(value) => setFormData({ ...formData, archive_depth_days: value })}
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
                onClick={() => setIsEditDialogOpen(false)}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить камеру?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить камеру "{cameraToDelete?.name}"? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
