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
  const [logFilters, setLogFilters] = useState({ name: '', status: 'all', owner: 'Все собственники', group: 'all', division: 'all', rtsp: '' });

  const RAW_LOGS = useMemo(() => {
    const events = [
      { status: 'success', event: 'Успешное получение изображения' },
      { status: 'success', event: 'Кадр получен, аналитика выполнена' },
      { status: 'auth_error', event: 'Отказ по авторизации RTSP' },
      { status: 'auth_error', event: 'Неверный логин/пароль RTSP' },
      { status: 'unavailable', event: 'Камера недоступна (timeout)' },
      { status: 'unavailable', event: 'Соединение разорвано' },
    ];
    const groups = ['Центральный', 'Ленинский', 'Свердловский'];
    const divisions = ['Район 1', 'Район 2', 'Район 3'];
    const logs = [];
    let id = 1;
    for (let i = 0; i < 80; i++) {
      const cam = ALL_CAMERAS[i % ALL_CAMERAS.length];
      const e = events[Math.floor(Math.abs(Math.sin(id * 7)) * events.length)];
      const h = String(Math.floor(Math.abs(Math.sin(id * 3)) * 24)).padStart(2, '0');
      const m = String(Math.floor(Math.abs(Math.sin(id * 5)) * 60)).padStart(2, '0');
      logs.push({
        id: id++,
        time: `24.03.2026 ${h}:${m}`,
        camera: cam.name,
        owner: cam.owner,
        group: groups[i % groups.length],
        division: divisions[i % divisions.length],
        rtsp: `rtsp://192.168.${i % 10}.${(i * 3) % 255}/stream`,
        status: e.status,
        event: e.event,
      });
    }
    return logs;
  }, []);

  const filteredLogs = RAW_LOGS.filter(l => {
    if (logFilters.name && !l.camera.toLowerCase().includes(logFilters.name.toLowerCase())) return false;
    if (logFilters.status !== 'all' && l.status !== logFilters.status) return false;
    if (logFilters.owner !== 'Все собственники' && l.owner !== logFilters.owner) return false;
    if (logFilters.group !== 'all' && l.group !== logFilters.group) return false;
    if (logFilters.division !== 'all' && l.division !== logFilters.division) return false;
    if (logFilters.rtsp && !l.rtsp.includes(logFilters.rtsp)) return false;
    return true;
  });

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ScrollText" size={20} />
              Журнал событий камер
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              const rows = filteredLogs.map(l =>
                [l.time, l.camera, l.owner, l.group, l.division, l.rtsp, l.status, l.event].join(';')
              );
              const csv = ['Время;Камера;Собственник;Группа;Территория;RTSP;Статус;Событие', ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'logs.csv'; a.click();
              URL.revokeObjectURL(url);
              toast.success('Журнал скачан');
            }}>
              <Icon name="Download" size={14} className="mr-1" />
              Скачать CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
            <input
              className="col-span-2 md:col-span-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              placeholder="Наименование камеры"
              value={logFilters.name}
              onChange={e => setLogFilters(f => ({ ...f, name: e.target.value }))}
            />
            <Select value={logFilters.status} onValueChange={v => setLogFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="success">Успех</SelectItem>
                <SelectItem value="auth_error">Ошибка авторизации</SelectItem>
                <SelectItem value="unavailable">Недоступна</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logFilters.owner} onValueChange={v => setLogFilters(f => ({ ...f, owner: v }))}>
              <SelectTrigger><SelectValue placeholder="Собственник" /></SelectTrigger>
              <SelectContent>
                {OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={logFilters.group} onValueChange={v => setLogFilters(f => ({ ...f, group: v }))}>
              <SelectTrigger><SelectValue placeholder="Группа" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все группы</SelectItem>
                <SelectItem value="Центральный">Центральный</SelectItem>
                <SelectItem value="Ленинский">Ленинский</SelectItem>
                <SelectItem value="Свердловский">Свердловский</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logFilters.division} onValueChange={v => setLogFilters(f => ({ ...f, division: v }))}>
              <SelectTrigger><SelectValue placeholder="Терр. деление" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="Район 1">Район 1</SelectItem>
                <SelectItem value="Район 2">Район 2</SelectItem>
                <SelectItem value="Район 3">Район 3</SelectItem>
              </SelectContent>
            </Select>
            <input
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-mono"
              placeholder="RTSP адрес"
              value={logFilters.rtsp}
              onChange={e => setLogFilters(f => ({ ...f, rtsp: e.target.value }))}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground">Время</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Камера</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Собственник</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Группа</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">RTSP</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Статус</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Событие</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-border/50 hover:bg-muted/30">
                    <td className="p-2 text-muted-foreground text-xs whitespace-nowrap">{log.time}</td>
                    <td className="p-2 font-medium">{log.camera}</td>
                    <td className="p-2 text-muted-foreground">{log.owner}</td>
                    <td className="p-2 text-muted-foreground">{log.group}</td>
                    <td className="p-2 font-mono text-xs text-muted-foreground max-w-[120px] truncate">{log.rtsp}</td>
                    <td className="p-2">
                      {log.status === 'success' && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Успех</Badge>}
                      {log.status === 'auth_error' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">Ошибка авт.</Badge>}
                      {log.status === 'unavailable' && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Недоступна</Badge>}
                    </td>
                    <td className="p-2 text-xs">{log.event}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Записей не найдено</td></tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
          <p className="text-xs text-muted-foreground mt-2">Показано записей: {filteredLogs.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;