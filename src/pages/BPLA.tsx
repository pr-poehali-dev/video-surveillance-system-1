import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import BPLAMap from '@/components/bpla/BPLAMap';
import BPLAStatsPanel from '@/components/bpla/BPLAStatsPanel';
import BPLAPhotoModal from '@/components/bpla/BPLAPhotoModal';
import AddDetectionDialog from '@/components/bpla/AddDetectionDialog';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';
import { Button } from '@/components/ui/button';
import type { DroneDetection } from '@/components/bpla/types';
import { toast } from 'sonner';

const DETECTIONS_API = `${CAMERAS_SERVICE_API}?resource=drone-detections`;

const BPLA = () => {
  const [activeTab, setActiveTab] = useState('detections');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; detection: DroneDetection } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [detections, setDetections] = useState<DroneDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const loadDetections = useCallback(async () => {
    try {
      const r = await fetch(DETECTIONS_API);
      const d = await r.json();
      setDetections(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Не удалось загрузить обнаружения');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDetections();
  }, [loadDetections]);

  const updateDetection = async (id: number, patch: Record<string, unknown>) => {
    const res = await fetch(DETECTIONS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) {
      toast.error('Не удалось сохранить изменение');
      return;
    }
    loadDetections();
  };

  const deleteDetection = async (id: number) => {
    const res = await fetch(DETECTIONS_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error('Не удалось удалить запись');
      return;
    }
    toast.success('Запись удалена');
    loadDetections();
  };

  const totalDetections = overrides.total ?? detections.length;
  const activeCount = detections.filter(d => d.status === 'active').length;
  const highThreatCount = overrides.high ?? detections.filter(d => d.threat === 'high').length;
  const mediumThreatCount = overrides.medium ?? detections.filter(d => d.threat === 'medium').length;
  const lowThreatCount = overrides.low ?? detections.filter(d => d.threat === 'low').length;
  const pendingVerification = overrides.pending ?? detections.filter(d => d.confirmed === null).length;

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
        <p className="text-sm text-muted-foreground">Обнаружения БПЛА из базы данных</p>
        <Button onClick={() => setAddOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить обнаружение
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard colorClass="text-primary" bgClass="bg-primary/10" icon="Radar" label="Всего" value={totalDetections} resetKey="total" />
        <StatCard colorClass="text-red-500" bgClass="bg-red-500/10" icon="AlertTriangle" label="Высокая угроза" value={highThreatCount} resetKey="high" />
        <StatCard colorClass="text-yellow-500" bgClass="bg-yellow-500/10" icon="AlertCircle" label="Средняя угроза" value={mediumThreatCount} resetKey="medium" />
        <StatCard colorClass="text-green-500" bgClass="bg-green-500/10" icon="CheckCircle" label="Низкая угроза" value={lowThreatCount} resetKey="low" />
        <StatCard colorClass="text-orange-500" bgClass="bg-orange-500/10" icon="ShieldQuestion" label="Требует верификации" value={pendingVerification} resetKey="pending" noReset />
      </div>

      <BPLAMap detections={detections} />

      <BPLAStatsPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeCount}
        totalDetections={totalDetections}
        highThreatCount={highThreatCount}
        detections={detections}
        loading={loading}
        onConfirm={(id, value) => updateDetection(id, { confirmed: value })}
        onDelete={deleteDetection}
        onPhotoClick={setSelectedPhoto}
      />

      <AddDetectionDialog open={addOpen} onOpenChange={setAddOpen} onSaved={loadDetections} />

      <BPLAPhotoModal
        selectedPhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};

export default BPLA;