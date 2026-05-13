import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import BPLAMap from '@/components/bpla/BPLAMap';
import BPLAStatsPanel from '@/components/bpla/BPLAStatsPanel';
import BPLAPhotoModal from '@/components/bpla/BPLAPhotoModal';
import { MOCK_DETECTIONS } from '@/components/bpla/types';
import type { DroneDetection } from '@/components/bpla/types';

const BPLA = () => {
  const [activeTab, setActiveTab] = useState('detections');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; detection: DroneDetection } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const totalDetections = overrides.total ?? MOCK_DETECTIONS.length;
  const activeCount = MOCK_DETECTIONS.filter(d => d.status === 'active').length;
  const highThreatCount = overrides.high ?? MOCK_DETECTIONS.filter(d => d.threat === 'high').length;
  const mediumThreatCount = overrides.medium ?? MOCK_DETECTIONS.filter(d => d.threat === 'medium').length;
  const lowThreatCount = overrides.low ?? MOCK_DETECTIONS.filter(d => d.threat === 'low').length;
  const pendingVerification = overrides.pending ?? MOCK_DETECTIONS.filter(d => d.status === 'lost').length;

  const resetAll = () => setOverrides({ total: 0, high: 0, medium: 0, low: 0, pending: 0 });
  const resetOne = (key: string) => setOverrides(prev => ({ ...prev, [key]: 0 }));

  const StatCard = ({ colorClass, bgClass, icon, label, value, resetKey, noReset }: {
    colorClass: string; bgClass: string; icon: string; label: string; value: number; resetKey: string; noReset?: boolean;
  }) => (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
            <Icon name={icon} size={20} className={colorClass} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
          </div>
          {!noReset && (
            <button
              onClick={() => resetOne(resetKey)}
              title="Обнулить"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Icon name="RotateCcw" size={13} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <Icon name="RotateCcw" size={13} />
          Обнулить всё
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard colorClass="text-primary" bgClass="bg-primary/10" icon="Radar" label="Всего" value={totalDetections} resetKey="total" />
        <StatCard colorClass="text-red-500" bgClass="bg-red-500/10" icon="AlertTriangle" label="Высокий" value={highThreatCount} resetKey="high" />
        <StatCard colorClass="text-yellow-500" bgClass="bg-yellow-500/10" icon="AlertCircle" label="Средний" value={mediumThreatCount} resetKey="medium" />
        <StatCard colorClass="text-green-500" bgClass="bg-green-500/10" icon="CheckCircle" label="Низкий" value={lowThreatCount} resetKey="low" />
        <StatCard colorClass="text-orange-500" bgClass="bg-orange-500/10" icon="ShieldQuestion" label="Требует верификации" value={pendingVerification} resetKey="pending" noReset />
      </div>

      <BPLAMap />

      <BPLAStatsPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeCount}
        totalDetections={totalDetections}
        highThreatCount={highThreatCount}
        onPhotoClick={setSelectedPhoto}
      />

      <BPLAPhotoModal
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};

export default BPLA;