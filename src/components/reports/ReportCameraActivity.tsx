import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

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

interface ReportCameraActivityProps {
  selectedPeriod: string;
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
}

export const ReportCameraActivity = ({ selectedPeriod, ownerFilter, onOwnerFilterChange }: ReportCameraActivityProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Активность камер за последние {selectedPeriod} дней
          </CardTitle>
          <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
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
  );
};

export default ReportCameraActivity;
