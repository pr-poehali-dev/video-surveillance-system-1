import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { ReportStatsCards } from '@/components/reports/ReportStatsCards';
import { ReportAnalyticsCards } from '@/components/reports/ReportAnalyticsCards';
import { ReportCameraActivity } from '@/components/reports/ReportCameraActivity';
import { ReportEventLog } from '@/components/reports/ReportEventLog';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [ownerFilter, setOwnerFilter] = useState('Все собственники');

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

  const periodLabel = selectedPeriod === '7' ? '7 дней' : selectedPeriod === '30' ? '30 дней' : '90 дней';

  const prevStats = {
    facesDetected: Math.round(stats.facesDetected * 0.87),
    platesDetected: Math.round(stats.platesDetected * 0.91),
    vehiclesDetected: Math.round(stats.vehiclesDetected * 0.94),
    totalUptime: 97.2,
  };

  const delta = (current: number, prev: number) => {
    const diff = ((current - prev) / prev) * 100;
    return { value: Math.abs(diff).toFixed(1), positive: diff >= 0 };
  };

  const handleExportCSV = () => {
    const rows = [
      ['Показатель', 'Значение', 'Период'],
      ['Аптайм системы (%)', stats.totalUptime, periodLabel],
      ['Средний аптайм камер (%)', stats.avgUptime, periodLabel],
      ['Обнаружено лиц', stats.facesDetected, periodLabel],
      ['Обнаружено людей', stats.peopleDetected, periodLabel],
      ['Обнаружено ТС', stats.vehiclesDetected, periodLabel],
      ['Распознано ГРЗ', stats.platesDetected, periodLabel],
      ['Всего камер', stats.totalCameras, periodLabel],
      ['Камеры с распознаванием лиц', stats.faceRecognition, periodLabel],
      ['Камеры с распознаванием ГРЗ', stats.plateRecognition, periodLabel],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}_${selectedPeriod}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Отчёт выгружен в CSV');
  };

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
            <Button variant="outline" onClick={handleExportCSV}>
              <Icon name="Download" size={16} className="mr-2" />
              Выгрузить CSV
            </Button>
          </div>
        </div>
      </div>

      <ReportAnalyticsCards stats={stats} selectedPeriod={selectedPeriod} />

      {/* Блок сравнения периодов */}
      <div className="mb-6 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="ArrowLeftRight" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Сравнение с предыдущим периодом ({periodLabel})</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Лица', current: stats.facesDetected, prev: prevStats.facesDetected },
            { label: 'ГРЗ', current: stats.platesDetected, prev: prevStats.platesDetected },
            { label: 'ТС', current: stats.vehiclesDetected, prev: prevStats.vehiclesDetected },
            { label: 'Аптайм, %', current: stats.totalUptime, prev: prevStats.totalUptime },
          ].map(({ label, current, prev }) => {
            const d = delta(current, prev);
            return (
              <div key={label} className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold">{typeof current === 'number' && current > 1000 ? current.toLocaleString('ru-RU') : current}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${d.positive ? 'text-green-600' : 'text-red-500'}`}>
                  <Icon name={d.positive ? 'TrendingUp' : 'TrendingDown'} size={12} />
                  <span>{d.positive ? '+' : '-'}{d.value}% vs прошлый период</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Было: {typeof prev === 'number' && prev > 1000 ? prev.toLocaleString('ru-RU') : prev}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ReportStatsCards stats={stats} selectedPeriod={selectedPeriod} />

      <ReportCameraActivity
        selectedPeriod={selectedPeriod}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
      />

      <ReportEventLog />
    </div>
  );
};

export default Reports;