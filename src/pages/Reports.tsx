import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCamera, setSelectedCamera] = useState('all');

  const cameras = [
    { id: 'all', name: 'Все камеры' },
    { id: '1', name: 'Камера-001' },
    { id: '2', name: 'Камера-002' },
    { id: '3', name: 'Камера-003' },
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
            <h1 className="text-2xl font-bold">Отчеты</h1>
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
            <Button variant="outline" onClick={() => handleExport('PDF')}>
              <Icon name="FileDown" size={18} className="mr-2" />
              Экспорт PDF
            </Button>
            <Button onClick={() => handleExport('Excel')}>
              <Icon name="FileSpreadsheet" size={18} className="mr-2" />
              Экспорт Excel
            </Button>
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
              Средняя работоспособность камер
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
              Общее время простоя
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

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Активность камер за последние {selectedPeriod} дней
            </CardTitle>
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 flex items-end justify-between gap-2">
              {Array.from({ length: parseInt(selectedPeriod) }).map((_, index) => {
                const value = 85 + Math.random() * 15;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                        style={{ height: `${value * 2.5}px` }}
                        title={`День ${index + 1}: ${value.toFixed(1)}%`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span className="text-sm text-muted-foreground">Время работы (%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Распознавание лиц и людей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Icon name="User" size={24} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Обнаружено лиц</p>
                    <p className="text-2xl font-bold">{stats.facesDetected.toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('faces-csv')}>
                  <Icon name="Download" size={14} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Обнаружено людей</p>
                    <p className="text-2xl font-bold">{stats.peopleDetected.toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('people-csv')}>
                  <Icon name="Download" size={14} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round((stats.facesDetected + stats.peopleDetected) / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
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
              Распознавание ГРЗ и транспорта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon name="Hash" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Обнаружено ГРЗ</p>
                    <p className="text-2xl font-bold">{stats.platesDetected.toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('plates-csv')}>
                  <Icon name="Download" size={14} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon name="CarFront" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Обнаружено ТС</p>
                    <p className="text-2xl font-bold">{stats.vehiclesDetected.toLocaleString('ru-RU')}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('vehicles-csv')}>
                  <Icon name="Download" size={14} className="mr-1" />
                  CSV
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round((stats.platesDetected + stats.vehiclesDetected) / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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