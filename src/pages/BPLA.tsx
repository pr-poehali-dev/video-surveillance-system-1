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

  const totalDetections = MOCK_DETECTIONS.length;
  const activeCount = MOCK_DETECTIONS.filter(d => d.status === 'active').length;
  const neutralizedCount = MOCK_DETECTIONS.filter(d => d.status === 'neutralized').length;
  const highThreatCount = MOCK_DETECTIONS.filter(d => d.threat === 'high').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Radar" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего</p>
                <p className="text-2xl font-bold">{totalDetections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon name="Plane" size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold text-red-500">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Icon name="ShieldCheck" size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Нейтрализовано</p>
                <p className="text-2xl font-bold text-green-500">{neutralizedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Высокая угроза</p>
                <p className="text-2xl font-bold text-red-500">{highThreatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
