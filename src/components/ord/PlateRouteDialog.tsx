import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { SearchResult } from './SearchResultCard';
import { Recognition, fetchRecognitions, toMapPoints } from './ordApi';

interface PlateRouteDialogProps {
  selected: SearchResult | null;
  onClose: () => void;
}

export const PlateRouteDialog = ({ selected, onClose }: PlateRouteDialogProps) => {
  const [items, setItems] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected?.plate) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetchRecognitions({ kind: 'plate', plate: selected.plate })
      .then((list) => setItems([...list].reverse()))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selected]);

  const points = useMemo(() => toMapPoints(items), [items]);

  return (
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Icon name="Route" size={22} className="text-primary" />
            Маршрут проезда
            {selected?.plate && (
              <Badge className="ml-2 text-sm px-3 py-1 font-mono" variant="secondary">
                {selected.plate}
              </Badge>
            )}
            <DialogClose asChild className="ml-auto">
              <Button size="icon" variant="secondary" title="Закрыть">
                <Icon name="X" size={18} />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 rounded-xl overflow-hidden border">
          {points.length > 0 ? (
            <YandexMap points={points} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {loading ? 'Загрузка...' : 'Нет проездов с координатами камер'}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {points.map((point, index) => (
            <div key={index} className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 text-xs">
              <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {index + 1}
              </Badge>
              <span className="font-medium">{point.label}</span>
              <span className="text-muted-foreground">{point.time}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
