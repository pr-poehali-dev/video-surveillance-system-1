import { useState, useEffect } from 'react';
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
import YandexMap from '@/components/YandexMap';
import { api, Camera, CameraStats } from '@/lib/api';

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState<CameraStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [camerasData, statsData] = await Promise.all([
        api.getCameras(),
        api.getStats()
      ]);
      setCameras(camerasData);
      setStats(statsData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    const matchesGroup = groupFilter === 'all' || camera.group === groupFilter;
    return matchesSearch && matchesStatus && matchesOwner && matchesGroup;
  });

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center h-96">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Мониторинг</h1>
        <p className="text-sm text-muted-foreground">
          Интерактивная карта камер видеонаблюдения
        </p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    className="pl-10"
                  />
                </div>

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

                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Фильтр по группе" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все группы</SelectItem>
                    <SelectItem value="Центральный район">Центральный район</SelectItem>
                    <SelectItem value="Дзержинский район">Дзержинский район</SelectItem>
                    <SelectItem value="Индустриальный район">Индустриальный район</SelectItem>
                    <SelectItem value="Ленинский район">Ленинский район</SelectItem>
                    <SelectItem value="Мотовилихинский район">Мотовилихинский район</SelectItem>
                    <SelectItem value="Свердловский район">Свердловский район</SelectItem>
                    <SelectItem value="Кировский район">Кировский район</SelectItem>
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
              <div className="relative rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <YandexMap
                  cameras={filteredCameras}
                  onCameraClick={(camera) => {
                    setSelectedCamera(camera);
                    setShowVideoDialog(true);
                  }}
                  height="600px"
                  clusteringEnabled={clusteringEnabled}
                />
              </div>
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