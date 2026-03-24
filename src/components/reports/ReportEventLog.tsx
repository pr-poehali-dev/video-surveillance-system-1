import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
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

export const ReportEventLog = () => {
  const [pageSize, setPageSize] = useState(100);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
      toast.success('Данные обновлены');
    }, 800);
  };
  const [logFilters, setLogFilters] = useState({
    name: '',
    status: 'all',
    owner: 'Все собственники',
    group: 'all',
    division: 'all',
    rtsp: '',
  });

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

  const handleDownload = () => {
    const rows = filteredLogs.map(l =>
      [l.time, l.camera, l.owner, l.group, l.division, l.rtsp, l.status, l.event].join(';')
    );
    const csv = ['Время;Камера;Собственник;Группа;Территория;RTSP;Статус;Событие', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'logs.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Журнал скачан');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ScrollText" size={20} />
              Журнал событий камер
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <Icon name="RefreshCw" size={14} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Icon name="Download" size={14} className="mr-1" />
              Скачать CSV
            </Button>
          </div>
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
              {filteredLogs.slice(0, pageSize).map((log) => (
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
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Показано записей: {Math.min(pageSize, filteredLogs.length)} из {filteredLogs.length}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Записей на странице:</span>
            <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportEventLog;