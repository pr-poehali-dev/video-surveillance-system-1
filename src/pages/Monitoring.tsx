import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import YandexMap from '@/components/YandexMap';
import { api, Camera, CameraStats } from '@/lib/api';

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [divisionFilter, setDivisionFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState<string[]>([]);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
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
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(camera.status);
    const matchesOwner = ownerFilter.length === 0 || ownerFilter.includes(camera.owner);
    const matchesGroup = groupFilter.length === 0 || groupFilter.includes(camera.group);
    const matchesDivision = divisionFilter.length === 0 || divisionFilter.includes(camera.territorial_division);
    const matchesTag = tagFilter.length === 0 || (camera.tags && tagFilter.some(t => camera.tags.includes(t)));
    const matchesAnalytics = analyticsFilter.length === 0 || (
      (analyticsFilter.includes('face') && camera.face_recognition) ||
      (analyticsFilter.includes('grz') && camera.grz_recognition)
    );
    return matchesSearch && matchesStatus && matchesOwner && matchesGroup && matchesDivision && matchesTag && matchesAnalytics;
  });

  const activeFiltersCount = [
    statusFilter.length > 0,
    ownerFilter.length > 0,
    groupFilter.length > 0,
    divisionFilter.length > 0,
    tagFilter.length > 0,
    analyticsFilter.length > 0,
  ].filter(Boolean).length;

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
    <div className="bg-background flex h-[calc(100vh-8rem)]">
      <div className="w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <Card className="h-full flex flex-col rounded-none border-t-0 border-l-0 border-b-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Icon name="List" size={20} />
                Реестр камер
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
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

                <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Icon name="Filter" size={16} />
                        Фильтры
                      </span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Фильтры камер</SheetTitle>
                      <SheetDescription>
                        Настройте параметры отображения камер
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <Label>Статус камеры</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'active', label: 'Активные' },
                            { value: 'inactive', label: 'Неактивные' },
                            { value: 'problem', label: 'Проблемные' },
                          ]}
                          selected={statusFilter}
                          onChange={setStatusFilter}
                          placeholder="Выберите статус"
                          searchPlaceholder="Поиск статуса..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Собственник</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'МВД', label: 'МВД' },
                            { value: 'Администрация', label: 'Администрация' },
                          ]}
                          selected={ownerFilter}
                          onChange={setOwnerFilter}
                          placeholder="Выберите собственника"
                          searchPlaceholder="Поиск собственника..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Группа камер</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'Центральный район', label: 'Центральный район' },
                            { value: 'Дзержинский район', label: 'Дзержинский район' },
                            { value: 'Индустриальный район', label: 'Индустриальный район' },
                            { value: 'Ленинский район', label: 'Ленинский район' },
                            { value: 'Мотовилихинский район', label: 'Мотовилихинский район' },
                            { value: 'Свердловский район', label: 'Свердловский район' },
                            { value: 'Кировский район', label: 'Кировский район' },
                          ]}
                          selected={groupFilter}
                          onChange={setGroupFilter}
                          placeholder="Выберите группу"
                          searchPlaceholder="Поиск группы..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Территориальное деление</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'Центральный район', label: 'Центральный район' },
                            { value: 'Дзержинский район', label: 'Дзержинский район' },
                            { value: 'Индустриальный район', label: 'Индустриальный район' },
                            { value: 'Ленинский район', label: 'Ленинский район' },
                            { value: 'Мотовилихинский район', label: 'Мотовилихинский район' },
                            { value: 'Свердловский район', label: 'Свердловский район' },
                            { value: 'Кировский район', label: 'Кировский район' },
                          ]}
                          selected={divisionFilter}
                          onChange={setDivisionFilter}
                          placeholder="Выберите территорию"
                          searchPlaceholder="Поиск территории..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Теги</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'Важная', label: 'Важная' },
                            { value: 'Проблемная', label: 'Проблемная' },
                            { value: 'Новая', label: 'Новая' },
                            { value: 'На проверке', label: 'На проверке' },
                          ]}
                          selected={tagFilter}
                          onChange={setTagFilter}
                          placeholder="Выберите тег"
                          searchPlaceholder="Поиск тега..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Видеоаналитика</Label>
                        <MultiSelectCombobox
                          options={[
                            { value: 'face', label: 'Распознавание лиц' },
                            { value: 'grz', label: 'Распознавание ГРЗ' },
                          ]}
                          selected={analyticsFilter}
                          onChange={setAnalyticsFilter}
                          placeholder="Выберите тип аналитики"
                          searchPlaceholder="Поиск..."
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setStatusFilter([]);
                            setOwnerFilter([]);
                            setGroupFilter([]);
                            setDivisionFilter([]);
                            setTagFilter([]);
                            setAnalyticsFilter([]);
                          }}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Сбросить все фильтры
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <ScrollArea className="flex-1 h-full">
                <div className="p-4 space-y-3">
                  {filteredCameras.map((camera) => (
                    <Card
                      key={camera.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => { setSelectedCamera(camera); setShowVideoDialog(true); }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 ${getStatusColor(camera.status)} rounded-full`} />
                          <h4 className="font-medium">{camera.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {camera.address}
                        </p>
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

      <div className="flex-1 h-full">
          <Card className="h-full rounded-none border-0">
            <CardContent className="p-0 h-full">
              <div className="relative overflow-hidden h-full">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 mx-0 py-[345px]">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setClusteringEnabled(!clusteringEnabled)}
                    title={clusteringEnabled ? 'Отключить кластеризацию' : 'Включить кластеризацию'}
                    className="bg-background shadow-lg"
                  >
                    <Icon name={clusteringEnabled ? 'Layers' : 'Grid3x3'} size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFullscreen}
                    title="Полноэкранный режим"
                    className="bg-background shadow-lg"
                  >
                    <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} />
                  </Button>
                </div>
                <YandexMap
                  cameras={filteredCameras}
                  onCameraClick={(camera) => {
                    setSelectedCamera(camera);
                    setShowVideoDialog(true);
                  }}
                  height="100%"
                  clusteringEnabled={clusteringEnabled}
                />
              </div>
            </CardContent>
          </Card>
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
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {selectedCamera.hls_url ? (
                  <video
                    key={selectedCamera.hls_url}
                    src={selectedCamera.hls_url}
                    autoPlay
                    controls
                    muted
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLVideoElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ display: selectedCamera.hls_url ? 'none' : 'flex' }}
                >
                  {selectedCamera.rtsp_url ? (
                    <div className="text-center px-6">
                      <Icon name="Video" size={48} className="text-white/60 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">RTSP-поток</p>
                      <p className="text-white/50 text-xs mb-3 font-mono break-all">{selectedCamera.rtsp_url}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white/30 hover:bg-white/10"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCamera.rtsp_url!);
                          toast.success('Ссылка скопирована');
                        }}
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Скопировать ссылку
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Icon name="VideoOff" size={48} className="text-white/40 mx-auto mb-2" />
                      <p className="text-white/60">Поток не настроен</p>
                      <p className="text-white/40 text-sm">{selectedCamera.resolution} • {selectedCamera.fps} FPS</p>
                    </div>
                  )}
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