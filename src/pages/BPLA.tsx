import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import BPLAMap from '@/components/bpla/BPLAMap';
import BPLAStatsPanel from '@/components/bpla/BPLAStatsPanel';
import BPLAPhotoModal from '@/components/bpla/BPLAPhotoModal';
import { MOCK_DETECTIONS } from '@/components/bpla/types';
import type { DroneDetection } from '@/components/bpla/types';
import { toast } from 'sonner';

const BPLA_ALERT_MESSAGES = [
  { threat: 'high', zone: 'Сектор А-1', type: 'FPV дрон' },
  { threat: 'high', zone: 'Сектор Б-2', type: 'Орлан-10' },
  { threat: 'medium', zone: 'Сектор В-3', type: 'Мавик 3' },
];

const BPLA = () => {
  const [activeTab, setActiveTab] = useState('detections');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; detection: DroneDetection } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const alertIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = BPLA_ALERT_MESSAGES[alertIndexRef.current % BPLA_ALERT_MESSAGES.length];
      alertIndexRef.current += 1;
      if (msg.threat === 'high') {
        toast.error(`Обнаружен БПЛА — ${msg.type}`, {
          description: `Зона: ${msg.zone} · Угроза: Высокая`,
          duration: 6000,
        });
      } else {
        toast.warning(`Обнаружен БПЛА — ${msg.type}`, {
          description: `Зона: ${msg.zone} · Угроза: Средняя`,
          duration: 5000,
        });
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard colorClass="text-primary" bgClass="bg-primary/10" icon="Radar" label="Всего (24ч)" value={totalDetections} resetKey="total" />
        <StatCard colorClass="text-red-500" bgClass="bg-red-500/10" icon="AlertTriangle" label="Высокий (24ч)" value={highThreatCount} resetKey="high" />
        <StatCard colorClass="text-yellow-500" bgClass="bg-yellow-500/10" icon="AlertCircle" label="Средний (24ч)" value={mediumThreatCount} resetKey="medium" />
        <StatCard colorClass="text-green-500" bgClass="bg-green-500/10" icon="CheckCircle" label="Низкий (24ч)" value={lowThreatCount} resetKey="low" />
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