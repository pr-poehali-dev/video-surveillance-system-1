import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { threatColor, threatLabel, DRONE_PHOTOS } from './types';
import type { DroneDetection } from './types';

interface BPLAVideoModalProps {
  detection: DroneDetection | null;
  onClose: () => void;
  onConfirm: (id: number, value: boolean) => void;
}

const SPEEDS = [0.25, 0.5, 1, 2];

const BPLAVideoModal = ({ detection, onClose, onConfirm }: BPLAVideoModalProps) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!detection) return null;

  const frames = DRONE_PHOTOS;
  const totalFrames = frames.length;

  const startPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setFrameIndex(prev => {
        if (prev >= totalFrames - 1) {
          clearInterval(intervalRef.current!);
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.round(800 / speed));
  };

  const stopPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
  };

  const handleClose = () => {
    stopPlay();
    setFrameIndex(0);
    setSpeed(1);
    onClose();
  };

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    if (playing) {
      stopPlay();
      setTimeout(() => startPlay(), 50);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-card rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold">{detection.type} — {detection.zone}</p>
            <p className="text-xs text-muted-foreground font-mono">{detection.date} {detection.time} · {detection.camera}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={threatColor(detection.threat)}>
              {threatLabel(detection.threat)}
            </Badge>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="relative bg-black">
          <img
            src={frames[frameIndex]}
            alt={`Кадр ${frameIndex + 1}`}
            className="w-full object-contain max-h-[50vh]"
          />
          <div
            className="absolute pointer-events-none"
            style={{
              border: '2px solid #ef4444',
              boxShadow: '0 0 6px rgba(239,68,68,0.6)',
              top: '28%',
              left: '38%',
              width: '24%',
              height: '32%',
            }}
          >
            <span
              className="absolute -top-5 left-0 text-[10px] font-mono px-1 py-0.5 rounded"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              БПЛА
            </span>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400" />
          </div>
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
            Кадр {frameIndex + 1} / {totalFrames}
          </div>
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
            ×{speed}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFrameIndex(0)}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="В начало"
            >
              <Icon name="SkipBack" size={16} />
            </button>
            <button
              onClick={() => setFrameIndex(f => Math.max(0, f - 1))}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Предыдущий кадр"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={playing ? stopPlay : startPlay}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Icon name={playing ? 'Pause' : 'Play'} size={16} />
            </button>
            <button
              onClick={() => setFrameIndex(f => Math.min(totalFrames - 1, f + 1))}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Следующий кадр"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
            <button
              onClick={() => setFrameIndex(totalFrames - 1)}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="В конец"
            >
              <Icon name="SkipForward" size={16} />
            </button>

            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={frameIndex}
              onChange={e => { stopPlay(); setFrameIndex(Number(e.target.value)); }}
              className="flex-1 h-1.5 accent-primary"
            />

            <div className="flex items-center gap-1 text-xs ml-1">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded font-mono transition-colors ${speed === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  ×{s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onConfirm(detection.id, true); handleClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
            >
              <Icon name="CheckCircle" size={16} />
              Подтверждаю БПЛА
            </button>
            <button
              onClick={() => { onConfirm(detection.id, false); handleClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground font-medium text-sm transition-colors border border-border"
            >
              <Icon name="XCircle" size={16} />
              Отрицаю БПЛА
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPLAVideoModal;