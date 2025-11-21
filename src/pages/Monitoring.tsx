import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  owner: string;
  group: string;
  lat: number;
  lng: number;
  resolution: string;
  fps: number;
  traffic: number;
}

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const cameras: Camera[] = [
    { id: 1, name: 'Камера-001', address: 'г. Пермь, ул. Ленина, 50', status: 'active', owner: 'МВД', group: 'Центр города', lat: 58.010455, lng: 56.229443, resolution: '1920x1080', fps: 25, traffic: 4.2 },
    { id: 2, name: 'Камера-002', address: 'г. Пермь, ул. Монастырская, 12', status: 'active', owner: 'МВД', group: 'Центр города', lat: 58.011455, lng: 56.230443, resolution: '1920x1080', fps: 25, traffic: 3.8 },
    { id: 3, name: 'Камера-003', address: 'г. Пермь, ул. Сибирская, 27', status: 'problem', owner: 'МВД', group: 'Центр города', lat: 58.009455, lng: 56.228443, resolution: '1280x720', fps: 15, traffic: 2.1 },
    { id: 4, name: 'Камера-004', address: 'г. Пермь, Комсомольский пр., 68', status: 'active', owner: 'Администрация', group: 'Транспорт', lat: 58.012455, lng: 56.231443, resolution: '1920x1080', fps: 30, traffic: 5.1 },
    { id: 5, name: 'Камера-005', address: 'г. Пермь, ул. Петропавловская, 35', status: 'inactive', owner: 'МВД', group: 'Центр города', lat: 58.010955, lng: 56.229943, resolution: '1920x1080', fps: 0, traffic: 0 },
    { id: 6, name: 'Камера-006', address: 'г. Пермь, ул. Куйбышева, 95', status: 'active', owner: 'Администрация', group: 'Транспорт', lat: 58.013455, lng: 56.232443, resolution: '1920x1080', fps: 25, traffic: 4.5 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'problem':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активная';
      case 'inactive':
        return 'Неактивная';
      case 'problem':
        return 'Проблемная';
      default:
        return 'Неизвестно';
    }
  };

  const handleMyLocation = () => {
    toast.info('Определение местоположения...');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast.success(isFullscreen ? 'Обычный режим' : 'Полноэкранный режим');
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
    const matchesOwner = ownerFilter === 'all' || camera.owner === ownerFilter;
    return matchesSearch && matchesStatus && matchesOwner;
  });

  const stats = {
    total: cameras.length,
    active: cameras.filter((c) => c.status === 'active').length,
    inactive: cameras.filter((c) => c.status === 'inactive').length,
    problem: cameras.filter((c) => c.status === 'problem').length,
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Мониторинг</h1>
        <p className="text-sm text-muted-foreground">
          Интерактивная карта камер видеонаблюдения
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Icon name="Video" className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активные</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Неактивные</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <Icon name="XCircle" className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Проблемные</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.problem}</p>
              </div>
              <Icon name="AlertTriangle" className="text-yellow-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  Карта камер
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setClusteringEnabled(!clusteringEnabled)}
                    title={clusteringEnabled ? 'Отключить кластеризацию' : 'Включить кластеризацию'}
                  >
                    <Icon name={clusteringEnabled ? 'Layers' : 'Grid3x3'} size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMyLocation}
                    title="Мое местоположение"
                  >
                    <Icon name="MapPin" size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFullscreen}
                    title="Полноэкранный режим"
                  >
                    <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="Map" size={48} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Карта Пермского края с камерами
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Интеграция с картографическим сервисом
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="relative">
                    <Icon
                      name="Search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Поиск по адресу или названию камеры..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                {filteredCameras.map((camera) => (
                  <button
                    key={camera.id}
                    onClick={() => { setSelectedCamera(camera); setShowVideoDialog(true); }}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    style={{
                      left: `${20 + camera.id * 12}%`,
                      top: `${30 + camera.id * 8}%`,
                    }}
                  >
                    <div className={`w-8 h-8 ${getStatusColor(camera.status)} rounded-full flex items-center justify-center border-2 border-white`}>
                      <Icon name="Video" size={16} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="List" size={20} />
                Реестр камер
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3 border-b">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Фильтр по статусу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="inactive">Неактивные</SelectItem>
                    <SelectItem value="problem">Проблемные</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Фильтр по собственнику" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все собственники</SelectItem>
                    <SelectItem value="МВД">МВД</SelectItem>
                    <SelectItem value="Администрация">Администрация</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-3">
                  {filteredCameras.map((camera) => (
                    <Card
                      key={camera.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => { setSelectedCamera(camera); setShowVideoDialog(true); }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${getStatusColor(camera.status)} rounded-full`} />
                            <h4 className="font-medium">{camera.name}</h4>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {camera.owner}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {camera.address}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {camera.group}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(camera.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredCameras.length === 0 && (
                    <div className="text-center py-8">
                      <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Камеры не найдены</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Video" size={20} />
              {selectedCamera?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedCamera && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Play" size={64} className="text-white mx-auto mb-2" />
                  <p className="text-white">Видеопоток</p>
                  <p className="text-white/60 text-sm">{selectedCamera.resolution} • {selectedCamera.fps} FPS</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Адрес</p>
                  <p className="font-medium">{selectedCamera.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Статус</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${getStatusColor(selectedCamera.status)} rounded-full`} />
                    <span className="font-medium">{getStatusLabel(selectedCamera.status)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Разрешение</p>
                  <p className="font-medium">{selectedCamera.resolution}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">FPS</p>
                  <p className="font-medium">{selectedCamera.fps}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Трафик</p>
                  <p className="font-medium">{selectedCamera.traffic} Мбит/с</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Собственник</p>
                  <p className="font-medium">{selectedCamera.owner}</p>
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
    </div>
  );
};

export default Monitoring;
