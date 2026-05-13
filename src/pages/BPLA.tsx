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
  const highThreatCount = MOCK_DETECTIONS.filter(d => d.threat === 'high').length;
  const mediumThreatCount = MOCK_DETECTIONS.filter(d => d.threat === 'medium').length;
  const lowThreatCount = MOCK_DETECTIONS.filter(d => d.threat === 'low').length;

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
                <Icon name="AlertTriangle" size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Высокий</p>
                <p className="text-2xl font-bold text-red-500">{highThreatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Icon name="AlertCircle" size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Средний</p>
                <p className="text-2xl font-bold text-yellow-500">{mediumThreatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Низкий</p>
                <p className="text-2xl font-bold text-green-500">{lowThreatCount}</p>
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