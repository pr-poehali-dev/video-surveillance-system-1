import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { SearchResult } from './SearchResultCard';

const MOCK_ROUTE_POINTS = [
  { lat: 56.8389, lng: 60.6057, label: 'Камера-001', time: '2024-11-21 14:32:15' },
  { lat: 56.8412, lng: 60.6124, label: 'Камера-003', time: '2024-11-21 14:45:02' },
  { lat: 56.8350, lng: 60.5990, label: 'Камера-007', time: '2024-11-21 15:01:38' },
  { lat: 56.8298, lng: 60.6205, label: 'Камера-012', time: '2024-11-21 15:18:47' },
];

interface PlateRouteDialogProps {
  selected: SearchResult | null;
  onClose: () => void;
}

export const PlateRouteDialog = ({ selected, onClose }: PlateRouteDialogProps) => {
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
          <YandexMap points={MOCK_ROUTE_POINTS} />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {MOCK_ROUTE_POINTS.map((point, index) => (
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
