import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const OWNERS = ['Все собственники', 'МВД', 'Администрация', 'ФСИН', 'Росгвардия'];

const ALL_CAMERAS = [
  { id: '1', name: 'Камера-001', owner: 'МВД', status: 'active' },
  { id: '2', name: 'Камера-002', owner: 'МВД', status: 'active' },
  { id: '3', name: 'Камера-003', owner: 'Администрация', status: 'inactive' },
  { id: '4', name: 'Камера-004', owner: 'Администрация', status: 'active' },
  { id: '5', name: 'Камера-005', owner: 'ФСИН', status: 'problem' },
  { id: '6', name: 'Камера-006', owner: 'ФСИН', status: 'active' },
  { id: '7', name: 'Камера-007', owner: 'Росгвардия', status: 'active' },
  { id: '8', name: 'Камера-008', owner: 'Росгвардия', status: 'inactive' },
  { id: '9', name: 'Камера-009', owner: 'МВД', status: 'active' },
  { id: '10', name: 'Камера-010', owner: 'МВД', status: 'problem' },
];

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('Все собственники');

  const cameras = [
    { id: 'all', name: 'Все камеры' },
    ...ALL_CAMERAS.map(c => ({ id: c.id, name: c.name })),
  ];

  const stats = {
    totalUptime: 98.7,
    avgUptime: 96.4,
    facesDetected: 1247856,
    peopleDetected: 1389243,
    vehiclesDetected: 456782,
    platesDetected: 423891,
    totalCameras: 1247,
    faceRecognition: 856,
    plateRecognition: 723,
  };

  const cameraActivity = [
    { day: 1, uptime: 98, incidents: 2 },
    { day: 2, uptime: 99, incidents: 1 },
    { day: 3, uptime: 97, incidents: 3 },
    { day: 4, uptime: 100, incidents: 0 },
    { day: 5, uptime: 95, incidents: 5 },
    { day: 6, uptime: 98, incidents: 2 },
    { day: 7, uptime: 99, incidents: 1 },
  ];

  const handleExport = (type: string) => {
    toast.success(`Экспорт ${type} начат`);
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Статистика и аналитика системы видеонаблюдения
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="90">90 дней</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Пользователи системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Всего пользователей</span>
                  </div>
                  <span className="text-2xl font-bold">23</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Зарегистрировано в системе
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Онлайн</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">7</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(7 / 23) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((7 / 23) * 100).toFixed(1)}% активных пользователей
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Scan" size={20} />
              Возможности распознавания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={18} className="text-secondary" />
                    <span className="text-sm font-medium">Распознавание лиц</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.faceRecognition}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${(stats.faceRecognition / stats.totalCameras) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.faceRecognition / stats.totalCameras) * 100).toFixed(1)}% от общего числа камер
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="CarFront" size={18} className="text-primary" />
                    <span className="text-sm font-medium">Распознавание ГРЗ</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.plateRecognition}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(stats.plateRecognition / stats.totalCameras) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.plateRecognition / stats.totalCameras) * 100).toFixed(1)}% от общего числа камер
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Работоспособность портала
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">{stats.totalUptime}%</span>
                <Icon name="TrendingUp" className="text-green-600" size={24} />
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats.totalUptime}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">За последние {selectedPeriod} дней</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Работоспособность видеоаналитики распознавания лиц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">{stats.avgUptime}%</span>
                <Icon name="Video" className="text-blue-600" size={24} />
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${stats.avgUptime}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Среднее время работы</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Работоспособность видеоаналитики распознавания ГРЗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-600">26.4ч</span>
                <Icon name="AlertTriangle" className="text-orange-600" size={24} />
              </div>
              <p className="text-xs text-muted-foreground">Из {selectedPeriod * 24} часов</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Распознавание лиц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Icon name="User" size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обнаружено лиц</p>
                  <p className="text-2xl font-bold">{stats.facesDetected.toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round(stats.facesDetected / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CarFront" size={20} />
              Распознавание ГРЗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="Hash" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обнаружено ГРЗ</p>
                  <p className="text-2xl font-bold">{stats.platesDetected.toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round(stats.platesDetected / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Активность камер за последние {selectedPeriod} дней
            </CardTitle>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OWNERS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const filtered = ownerFilter === 'Все собственники'
                ? ALL_CAMERAS
                : ALL_CAMERAS.filter(c => c.owner === ownerFilter);
              const days = parseInt(selectedPeriod);
              return filtered.map((camera) => {
                const isWorking = camera.status === 'active';
                const seed = parseInt(camera.id);
                const dayValues = Array.from({ length: days }, (_, i) => {
                  const r = Math.sin(seed * 9301 + i * 49297 + 233) * 0.5 + 0.5;
                  return isWorking ? (r > 0.1 ? 'active' : 'inactive') : (r > 0.7 ? 'active' : 'inactive');
                });
                const activeCount = dayValues.filter(v => v === 'active').length;
                const pct = Math.round((activeCount / days) * 100);
                return (
                  <div key={camera.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{camera.name}</span>
                        <span className="text-muted-foreground text-xs">{camera.owner}</span>
                      </div>
                      <span className={`font-semibold text-xs ${pct >= 80 ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
                    </div>
                    <div className="flex gap-px h-5">
                      {dayValues.map((val, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${val === 'active' ? 'bg-green-500' : 'bg-red-400'}`}
                          title={`День ${i + 1}: ${val === 'active' ? 'Работает' : 'Не работает'}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex items-center gap-6 pt-4 mt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-xs text-muted-foreground">Работает</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <span className="text-xs text-muted-foreground">Не работает</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="List" size={20} />
            Детализация по камерам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {cameras.slice(1).map((camera, index) => {
                const activity = cameraActivity[index % cameraActivity.length];
                return (
                  <Card key={camera.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Icon name="Video" size={20} className="text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{camera.name}</p>
                            <p className="text-xs text-muted-foreground">ул. Ленина, {50 + index * 10}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Работоспособность</p>
                            <p className="text-lg font-bold text-green-600">{activity.uptime}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Инциденты</p>
                            <p className="text-lg font-bold">{activity.incidents}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Icon name="FileText" size={14} className="mr-1" />
                            Отчет
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;