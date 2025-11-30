import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  model: string;
  address: string;
  owner: string;
  status: string;
  archiveDepth: number;
}

interface CameraListProps {
  cameras: Camera[];
}

export const CameraList = ({ cameras }: CameraListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cameraToEdit, setCameraToEdit] = useState<Camera | null>(null);
  const [testingStream, setTestingStream] = useState(false);

  const filteredCameras = cameras.filter(camera => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address.toLowerCase().includes(query) ||
      camera.owner.toLowerCase().includes(query)
    );
  });

  const handleEdit = (camera: Camera) => {
    setCameraToEdit(camera);
    setIsEditDialogOpen(true);
  };

  const handleTestStream = () => {
    setTestingStream(true);
    setTimeout(() => {
      setTestingStream(false);
      toast.success('Видеопоток успешно проверен');
    }, 2000);
  };

  const handleDelete = (cameraId: number) => {
    toast.success(`Камера #${cameraId} удалена`);
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(camera)}
                    >
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
                    <p className="font-medium">{camera.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Собственник:</span>
                    <p className="font-medium">{camera.owner}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Архив:</span>
                    <p className="font-medium">{camera.archiveDepth} дней</p>
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

          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Название камеры <span className="text-red-500">*</span></Label>
              <Input placeholder="Камера-001" defaultValue={cameraToEdit?.name} required />
            </div>

            <div className="space-y-2">
              <Label>RTSP ссылка на видеопоток <span className="text-red-500">*</span></Label>
              <Input
                placeholder="rtsp://username:password@ip:port/stream"
                className="font-mono text-sm"
                defaultValue={cameraToEdit?.rtspUrl}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Логин RTSP</Label>
                <Input placeholder="admin" />
              </div>
              <div className="space-y-2">
                <Label>Пароль RTSP</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleTestStream}
                disabled={testingStream}
                type="button"
              >
                {testingStream ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="Play" size={18} className="mr-2" />
                    Проверить видеопоток
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Марка и модель камеры</Label>
              <Select defaultValue={cameraToEdit?.model}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hikvision-ds2cd">Hikvision DS-2CD2143G0-I</SelectItem>
                  <SelectItem value="dahua-ipc">Dahua IPC-HDBW4631R-ZS</SelectItem>
                  <SelectItem value="axis-p3375">Axis P3375-V</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP адрес PTZ</Label>
                <Input placeholder="192.168.1.10" />
              </div>
              <div className="space-y-2">
                <Label>Порт PTZ</Label>
                <Input placeholder="8000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Логин PTZ</Label>
                <Input placeholder="admin" />
              </div>
              <div className="space-y-2">
                <Label>Пароль PTZ</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Собственник камеры <span className="text-red-500">*</span></Label>
              <Select defaultValue={cameraToEdit?.owner} required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите собственника" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="МВД">МВД</SelectItem>
                  <SelectItem value="Администрация">Администрация</SelectItem>
                  <SelectItem value="ГИБДД">ГИБДД</SelectItem>
                  <SelectItem value="МЧС">МЧС</SelectItem>
                  <SelectItem value="Частное лицо">Частное лицо</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Глубина хранения видеоархива (дней) <span className="text-red-500">*</span></Label>
              <Select defaultValue={cameraToEdit?.archiveDepth.toString() || '30'} required>
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
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите территорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Центральный район</SelectItem>
                  <SelectItem value="leninsky">Ленинский район</SelectItem>
                  <SelectItem value="dzer">Дзержинский район</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Адрес местоположения <span className="text-red-500">*</span></Label>
              <Input placeholder="Определится автоматически по координатам" defaultValue={cameraToEdit?.address} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Широта <span className="text-red-500">*</span></Label>
                <Input placeholder="58.0105" type="number" step="any" required />
              </div>
              <div className="space-y-2">
                <Label>Долгота <span className="text-red-500">*</span></Label>
                <Input placeholder="56.2502" type="number" step="any" required />
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="button" className="flex-1" onClick={() => {
                toast.success('Камера обновлена');
                setIsEditDialogOpen(false);
              }}>
                Сохранить изменения
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
              Вы уверены, что хотите удалить камеру "{cameraToDelete?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cameraToDelete) {
                  handleDelete(cameraToDelete.id);
                  setCameraToDelete(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};