import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
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

      <ReportAnalyticsCards stats={stats} selectedPeriod={selectedPeriod} />

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
