import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface DroneDetection {
  id: number;
  time: string;
  date: string;
  type: string;
  lat: number;
  lng: number;
  zone: string;
  threat: 'high' | 'medium' | 'low';
  status: 'active' | 'neutralized' | 'lost';
  altitude: number;
  speed: number;
}

interface Alert {
  id: number;
  time: string;
  date: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  zone: string;
}

const MOCK_DETECTIONS: DroneDetection[] = [
  { id: 1, time: '09:14:22', date: '13.05.2026', type: 'FPV дрон', lat: 55.7558, lng: 37.6173, zone: 'Сектор А-1', threat: 'high', status: 'neutralized', altitude: 45, speed: 120 },
  { id: 2, time: '10:32:07', date: '13.05.2026', type: 'Мавик 3', lat: 55.7612, lng: 37.6310, zone: 'Сектор Б-2', threat: 'medium', status: 'lost', altitude: 80, speed: 65 },
  { id: 3, time: '11:05:44', date: '13.05.2026', type: 'FPV дрон', lat: 55.7489, lng: 37.6055, zone: 'Сектор А-3', threat: 'high', status: 'active', altitude: 30, speed: 140 },
  { id: 4, time: '12:18:33', date: '13.05.2026', type: 'Орлан-10', lat: 55.7701, lng: 37.6440, zone: 'Сектор В-1', threat: 'high', status: 'neutralized', altitude: 200, speed: 90 },
  { id: 5, time: '13:44:11', date: '13.05.2026', type: 'Мавик 3', lat: 55.7530, lng: 37.6250, zone: 'Сектор Б-1', threat: 'low', status: 'lost', altitude: 60, speed: 55 },
  { id: 6, time: '14:02:58', date: '13.05.2026', type: 'Призма', lat: 55.7640, lng: 37.6100, zone: 'Сектор А-2', threat: 'medium', status: 'active', altitude: 150, speed: 75 },
  { id: 7, time: '14:55:20', date: '13.05.2026', type: 'FPV дрон', lat: 55.7510, lng: 37.6380, zone: 'Сектор В-2', threat: 'high', status: 'neutralized', altitude: 25, speed: 160 },
  { id: 8, time: '15:30:05', date: '13.05.2026', type: 'Мавик 3', lat: 55.7580, lng: 37.6200, zone: 'Сектор Б-3', threat: 'low', status: 'lost', altitude: 70, speed: 50 },
];

const MOCK_ALERTS: Alert[] = [
  { id: 1, time: '09:14:22', date: '13.05.2026', message: 'Обнаружен FPV дрон в секторе А-1. Угроза высокая. Активирована система РЭБ.', type: 'danger', zone: 'Сектор А-1' },
  { id: 2, time: '09:16:10', date: '13.05.2026', message: 'FPV дрон нейтрализован. Угроза устранена.', type: 'info', zone: 'Сектор А-1' },
  { id: 3, time: '10:32:07', date: '13.05.2026', message: 'Зафиксирован Мавик 3 в секторе Б-2. Угроза средняя.', type: 'warning', zone: 'Сектор Б-2' },
  { id: 4, time: '10:45:30', date: '13.05.2026', message: 'Мавик 3 потерян из поля зрения. Ведётся наблюдение.', type: 'warning', zone: 'Сектор Б-2' },
  { id: 5, time: '11:05:44', date: '13.05.2026', message: '⚠ ТРЕВОГА! FPV дрон в секторе А-3. Высокая угроза. Скорость 140 км/ч.', type: 'danger', zone: 'Сектор А-3' },
  { id: 6, time: '12:18:33', date: '13.05.2026', message: 'Обнаружен Орлан-10 на высоте 200м. Подозрение на разведывательный.', type: 'danger', zone: 'Сектор В-1' },
  { id: 7, time: '12:34:50', date: '13.05.2026', message: 'Орлан-10 нейтрализован системой РЭБ.', type: 'info', zone: 'Сектор В-1' },
  { id: 8, time: '14:02:58', date: '13.05.2026', message: 'Обнаружен БПЛА типа Призма в секторе А-2. Ведётся слежение.', type: 'warning', zone: 'Сектор А-2' },
];

const ZONE_STATS = [
  { zone: 'Сектор А', count: 3, neutralized: 2 },
  { zone: 'Сектор Б', count: 3, neutralized: 0 },
  { zone: 'Сектор В', count: 2, neutralized: 1 },
];

const TYPE_STATS = [
  { type: 'FPV дрон', count: 3, percent: 37 },
  { type: 'Мавик 3', count: 3, percent: 37 },
  { type: 'Орлан-10', count: 1, percent: 13 },
  { type: 'Призма', count: 1, percent: 13 },
];

const threatColor = (t: DroneDetection['threat']) => {
  if (t === 'high') return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (t === 'medium') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  return 'bg-green-500/10 text-green-500 border-green-500/20';
};

const threatLabel = (t: DroneDetection['threat']) => {
  if (t === 'high') return 'Высокая';
  if (t === 'medium') return 'Средняя';
  return 'Низкая';
};

const statusColor = (s: DroneDetection['status']) => {
  if (s === 'active') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (s === 'neutralized') return 'bg-green-500/10 text-green-400 border-green-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

const statusLabel = (s: DroneDetection['status']) => {
  if (s === 'active') return 'Активен';
  if (s === 'neutralized') return 'Нейтрализован';
  return 'Потерян';
};

const alertBg = (t: Alert['type']) => {
  if (t === 'danger') return 'border-l-4 border-red-500 bg-red-500/5';
  if (t === 'warning') return 'border-l-4 border-yellow-500 bg-yellow-500/5';
  return 'border-l-4 border-blue-500 bg-blue-500/5';
};

const alertIcon = (t: Alert['type']) => {
  if (t === 'danger') return 'AlertTriangle';
  if (t === 'warning') return 'AlertCircle';
  return 'Info';
};

const alertIconColor = (t: Alert['type']) => {
  if (t === 'danger') return 'text-red-500';
  if (t === 'warning') return 'text-yellow-500';
  return 'text-blue-500';
};

const MapPlaceholder = () => {
  const sectors = [
    { id: 'А-1', x: 15, y: 20, drone: true, threat: 'high' as const },
    { id: 'А-2', x: 42, y: 20, drone: true, threat: 'medium' as const },
    { id: 'А-3', x: 68, y: 20, drone: true, threat: 'high' as const },
    { id: 'Б-1', x: 15, y: 50, drone: true, threat: 'low' as const },
    { id: 'Б-2', x: 42, y: 50, drone: true, threat: 'medium' as const },
    { id: 'Б-3', x: 68, y: 50, drone: true, threat: 'low' as const },
    { id: 'В-1', x: 15, y: 78, drone: true, threat: 'high' as const },
    { id: 'В-2', x: 42, y: 78, drone: true, threat: 'high' as const },
  ];

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="absolute top-3 left-3 bg-black/60 rounded px-2 py-1 text-xs text-slate-300 font-mono">
        ТАКТИЧЕСКАЯ КАРТА / БПЛА
      </div>

      {sectors.map((s) => {
        const color = s.threat === 'high' ? '#ef4444' : s.threat === 'medium' ? '#eab308' : '#22c55e';
        return (
          <div
            key={s.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse shadow-lg"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="text-xs font-mono px-1 rounded" style={{ color, backgroundColor: `${color}20` }}>
              {s.id}
            </span>
          </div>
        );
      })}

      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-slate-400">Высокая угроза</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-slate-400">Средняя угроза</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">Низкая угроза</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 bg-black/60 rounded px-2 py-1 text-xs text-slate-400 font-mono">
        {new Date().toLocaleTimeString('ru-RU')}
      </div>
    </div>
  );
};

const BPLA = () => {
  const [activeTab, setActiveTab] = useState('detections');

  const totalDetections = MOCK_DETECTIONS.length;
  const activeCount = MOCK_DETECTIONS.filter(d => d.status === 'active').length;
  const neutralizedCount = MOCK_DETECTIONS.filter(d => d.status === 'neutralized').length;
  const highThreatCount = MOCK_DETECTIONS.filter(d => d.threat === 'high').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Детектирование БПЛА</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Мониторинг и контроль воздушного пространства</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Система активна
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Radar" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{totalDetections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon name="Plane" size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold text-red-500">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Icon name="ShieldCheck" size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Нейтрализовано</p>
                <p className="text-2xl font-bold text-green-500">{neutralizedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Высокая угроза</p>
                <p className="text-2xl font-bold text-red-500">{highThreatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-64 p-3">
            <MapPlaceholder />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detections">
            <Icon name="List" size={14} className="mr-1.5" />
            Обнаружения
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Icon name="BarChart3" size={14} className="mr-1.5" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Icon name="Bell" size={14} className="mr-1.5" />
            Журнал тревог
            {activeCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {activeCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detections">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Дата / Время</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Тип</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Зона</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Высота</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Скорость</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Угроза</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DETECTIONS.map((d) => (
                      <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-mono">{d.id}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <div>{d.date}</div>
                          <div className="text-muted-foreground">{d.time}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{d.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.zone}</td>
                        <td className="px-4 py-3">{d.altitude} м</td>
                        <td className="px-4 py-3">{d.speed} км/ч</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={threatColor(d.threat)}>
                            {threatLabel(d.threat)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={statusColor(d.status)}>
                            {statusLabel(d.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="MapPin" size={16} className="text-primary" />
                  По секторам
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ZONE_STATS.map((z) => (
                  <div key={z.zone}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{z.zone}</span>
                      <span className="text-muted-foreground">{z.neutralized}/{z.count} нейтрализовано</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(z.count / totalDetections) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>{z.count} обнаружений</span>
                      <span>{Math.round((z.count / totalDetections) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Plane" size={16} className="text-primary" />
                  По типам БПЛА
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {TYPE_STATS.map((t) => (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{t.type}</span>
                      <span className="text-muted-foreground">{t.count} шт.</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${t.percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.percent}% от общего</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  Сводка за день
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-red-500">{highThreatCount}</p>
                    <p className="text-sm text-muted-foreground mt-1">Высокая угроза</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-yellow-500">{MOCK_DETECTIONS.filter(d => d.threat === 'medium').length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Средняя угроза</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-green-500">{MOCK_DETECTIONS.filter(d => d.threat === 'low').length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Низкая угроза</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="p-4 space-y-2">
              {MOCK_ALERTS.map((a) => (
                <div key={a.id} className={`p-3 rounded-lg ${alertBg(a.type)}`}>
                  <div className="flex items-start gap-2">
                    <Icon name={alertIcon(a.type)} fallback="Info" size={16} className={`mt-0.5 shrink-0 ${alertIconColor(a.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{a.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">{a.date} {a.time}</span>
                        <span className="text-xs text-muted-foreground">{a.zone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BPLA;