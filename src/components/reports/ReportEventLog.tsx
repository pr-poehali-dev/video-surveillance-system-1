import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { ReportCamera } from './reportTypes';

const STATUS_LABELS: Record<string, string> = {
  active: 'Работает',
  inactive: 'Не работает',
  problem: 'Проблема',
};

interface ReportEventLogProps {
  cameras: ReportCamera[];
}

export const ReportEventLog = ({ cameras }: ReportEventLogProps) => {
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
    status: [] as string[],
    owner: [] as string[],
    division: [] as string[],
    rtsp: '',
  });

  const RAW_LOGS = useMemo(() => cameras.map((c) => {
    const status = c.status || 'active';
    return {
      id: c.id,
      time: c.updated_at ? new Date(c.updated_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—',
      camera: c.name,
      owner: c.owner || '—',
      division: c.territorial_division || '—',
      rtsp: c.rtsp_url || '',
      status,
      event: STATUS_LABELS[status] || status,
      fps: c.fps || 0,
    };
  }), [cameras]);

  const ownerOptions = useMemo(
    () => [...new Set(RAW_LOGS.map((l) => l.owner))].map((o) => ({ value: o, label: o })),
    [RAW_LOGS]
  );
  const divisionOptions = useMemo(
    () => [...new Set(RAW_LOGS.map((l) => l.division))].map((o) => ({ value: o, label: o })),
    [RAW_LOGS]
  );

  const filteredLogs = RAW_LOGS.filter(l => {
    if (logFilters.name && !l.camera.toLowerCase().includes(logFilters.name.toLowerCase())) return false;
    if (logFilters.status.length > 0 && !logFilters.status.includes(l.status)) return false;
    if (logFilters.owner.length > 0 && !logFilters.owner.includes(l.owner)) return false;
    if (logFilters.division.length > 0 && !logFilters.division.includes(l.division)) return false;
    if (logFilters.rtsp && !l.rtsp.includes(logFilters.rtsp)) return false;
    return true;
  });

  const handleDownload = () => {
    const rows = filteredLogs.map(l =>
      [l.time, l.camera, l.owner, l.division, l.rtsp, l.status, l.event].join(';')
    );
    const csv = ['Время;Камера;Собственник;Территория;RTSP;Статус;Состояние', ...rows].join('\n');
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
              Состояние камер
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
          <input
            className="col-span-2 md:col-span-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            placeholder="Наименование камеры"
            value={logFilters.name}
            onChange={e => setLogFilters(f => ({ ...f, name: e.target.value }))}
          />
          <MultiSelectCombobox
            options={[
              { value: 'active', label: 'Работает' },
              { value: 'inactive', label: 'Не работает' },
              { value: 'problem', label: 'Проблема' },
            ]}
            selected={logFilters.status}
            onChange={v => setLogFilters(f => ({ ...f, status: v }))}
            placeholder="Статус"
            searchPlaceholder="Поиск..."
          />
          <MultiSelectCombobox
            options={ownerOptions}
            selected={logFilters.owner}
            onChange={v => setLogFilters(f => ({ ...f, owner: v }))}
            placeholder="Собственник"
            searchPlaceholder="Поиск..."
          />
          <MultiSelectCombobox
            options={divisionOptions}
            selected={logFilters.division}
            onChange={v => setLogFilters(f => ({ ...f, division: v }))}
            placeholder="Терр. деление"
            searchPlaceholder="Поиск..."
          />
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
                <th className="text-left p-2 font-medium text-muted-foreground">RTSP</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Статус</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Кадров/мин</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Состояние</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, pageSize).map((log) => (
                <tr key={log.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="p-2 text-muted-foreground text-xs whitespace-nowrap">{log.time}</td>
                  <td className="p-2 font-medium">{log.camera}</td>
                  <td className="p-2 text-muted-foreground">{log.owner}</td>
                  <td className="p-2 font-mono text-xs text-muted-foreground max-w-[120px] truncate">{log.rtsp}</td>
                  <td className="p-2">
                    {log.status === 'active' && <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Работает</Badge>}
                    {log.status === 'problem' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">Проблема</Badge>}
                    {log.status === 'inactive' && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Не работает</Badge>}
                  </td>
                  <td className="p-2 text-xs text-center">
                    {log.fps > 0
                      ? <span className="font-mono text-green-700">{log.fps}</span>
                      : <span className="text-muted-foreground">—</span>}
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