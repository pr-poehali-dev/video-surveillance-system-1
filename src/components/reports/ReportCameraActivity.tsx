import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { ReportCamera } from './reportTypes';

const ALL_OWNERS = 'Все собственники';

interface ReportCameraActivityProps {
  selectedPeriod: string;
  cameras: ReportCamera[];
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
}

export const ReportCameraActivity = ({ selectedPeriod, cameras, ownerFilter, onOwnerFilterChange }: ReportCameraActivityProps) => {
  const owners = useMemo(
    () => [ALL_OWNERS, ...new Set(cameras.map((c) => c.owner).filter(Boolean) as string[])],
    [cameras]
  );

  const filtered = ownerFilter === ALL_OWNERS ? cameras : cameras.filter((c) => c.owner === ownerFilter);
  const working = filtered.filter((c) => c.status === 'active').length;
  const broken = filtered.length - working;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Текущее состояние камер
          </CardTitle>
          <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filtered.map((camera) => {
            const isWorking = camera.status === 'active';
            const label = camera.status === 'problem' ? 'Проблема' : isWorking ? 'Работает' : 'Не работает';
            return (
              <div key={camera.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500' : camera.status === 'problem' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{camera.name}</span>
                  <span className="text-muted-foreground text-xs">{camera.owner}</span>
                </div>
                <span className={`font-semibold text-xs ${isWorking ? 'text-green-600' : 'text-red-500'}`}>{label}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Камер нет</p>
          )}
        </div>
        <div className="pt-4 mt-3 border-t space-y-2">
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Работают</p>
              <p className="text-lg font-bold text-green-600">{working}</p>
            </div>
            <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Не работают или с проблемой</p>
              <p className="text-lg font-bold text-red-500">{broken}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            История работы по дням за {selectedPeriod} дн. пока не ведётся: показано текущее состояние.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCameraActivity;
