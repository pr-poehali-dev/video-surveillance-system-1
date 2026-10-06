import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { ReportStatsCards } from '@/components/reports/ReportStatsCards';
import { ReportAnalyticsCards } from '@/components/reports/ReportAnalyticsCards';
import { ReportCameraActivity } from '@/components/reports/ReportCameraActivity';
import { ReportEventLog } from '@/components/reports/ReportEventLog';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';
import { ReportCamera } from '@/components/reports/reportTypes';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [ownerFilter, setOwnerFilter] = useState('Все собственники');

  const [cameras, setCameras] = useState<ReportCamera[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersOnline, setUsersOnline] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    fetch(`${CAMERAS_SERVICE_API}?resource=registry`)
      .then((r) => r.json())
      .then((d) => setCameras(Array.isArray(d) ? d : []))
      .catch(() => setCameras([]));
    fetch(`${CAMERAS_SERVICE_API}?resource=stats`)
      .then((r) => r.json())
      .then((d) => {
        setUsersTotal(d.users_total ?? 0);
        setUsersOnline(d.users_online ?? 0);
        setActiveCount(d.active ?? 0);
      })
      .catch(() => undefined);
  }, []);

  const totalCameras = cameras.length;
  const availability = totalCameras > 0 ? Math.round((activeCount / totalCameras) * 1000) / 10 : 0;

  const stats = {
    totalUptime: availability,
    avgUptime: availability,
    facesDetected: 0,
    peopleDetected: 0,
    vehiclesDetected: 0,
    platesDetected: 0,
    totalCameras,
    faceRecognition: 0,
    plateRecognition: 0,
  };

  const periodLabel = selectedPeriod === '7' ? '7 дней' : selectedPeriod === '30' ? '30 дней' : '90 дней';

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

      <ReportAnalyticsCards stats={stats} selectedPeriod={selectedPeriod} usersTotal={usersTotal} usersOnline={usersOnline} />

      <ReportStatsCards stats={stats} selectedPeriod={selectedPeriod} />

      <ReportCameraActivity
        selectedPeriod={selectedPeriod}
        cameras={cameras}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
      />

      <ReportEventLog cameras={cameras} />
    </div>
  );
};

export default Reports;