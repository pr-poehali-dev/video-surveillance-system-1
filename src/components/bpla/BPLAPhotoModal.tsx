import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { threatColor, threatLabel } from './types';
import type { DroneDetection } from './types';

interface BPLAPhotoModalProps {
  selectedPhoto: { url: string; detection: DroneDetection } | null;
  onClose: () => void;
}

const BPLAPhotoModal = ({ selectedPhoto, onClose }: BPLAPhotoModalProps) => {
  if (!selectedPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold">{selectedPhoto.detection.type} — {selectedPhoto.detection.zone}</p>
            <p className="text-xs text-muted-foreground font-mono">{selectedPhoto.detection.date} {selectedPhoto.detection.time}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={threatColor(selectedPhoto.detection.threat)}>
              {threatLabel(selectedPhoto.detection.threat)}
            </Badge>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>
        <img
          src={selectedPhoto.url}
          alt="БПЛА"
          className="w-full object-contain max-h-[60vh]"
        />
        <div className="px-4 py-3 text-xs text-muted-foreground font-mono border-t border-border flex gap-4">
          <span>Координаты: {selectedPhoto.detection.lat.toFixed(4)}, {selectedPhoto.detection.lng.toFixed(4)}</span>
          <span>Зона: {selectedPhoto.detection.zone}</span>
        </div>
      </div>
    </div>
  );
};

export default BPLAPhotoModal;
