import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Recognition } from './ordApi';

interface RecognitionVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Recognition[];
  index: number;
  onIndexChange: (index: number) => void;
}

export const RecognitionVideoDialog = ({ open, onOpenChange, items, index, onIndexChange }: RecognitionVideoDialogProps) => {
  const current = items[index];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Video" size={18} />
            {current?.camera} — видеозапись
            <DialogClose asChild className="ml-auto">
              <Button size="icon" variant="secondary" title="Закрыть">
                <Icon name="X" size={18} />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{current?.address} · {current?.time}</p>
        <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative mt-2">
          {current?.videoUrl ? (
            <video key={current.id} src={current.videoUrl} controls className="w-full h-full" />
          ) : (
            <div className="text-center">
              <Icon name="VideoOff" size={48} className="text-white/30 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Видеозапись не загружена</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
          {items.map((det, i) => (
            <button
              key={det.id}
              onClick={() => onIndexChange(i)}
              className={`flex-shrink-0 rounded-lg border p-2 text-left transition-colors ${index === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <p className="text-xs font-medium">{det.camera}</p>
              <p className="text-xs text-muted-foreground">{det.time.split(' ')[1]}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
