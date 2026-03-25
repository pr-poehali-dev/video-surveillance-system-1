import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

export interface CameraOption {
  id: number;
  name: string;
  address?: string;
}

interface CameraMultiSelectProps {
  cameras: CameraOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onReset: () => void;
}

export const CameraMultiSelect = ({
  cameras,
  selectedIds,
  onToggle,
  onSelectAll,
  onReset,
}: CameraMultiSelectProps) => {
  const [search, setSearch] = useState('');

  const filtered = cameras.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Камеры для поиска</Label>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={onReset}>
              Сбросить
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={onSelectAll}>
            Выбрать все
          </Button>
        </div>
      </div>
      <Input
        placeholder="Поиск камеры..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="h-8 text-sm"
      />
      <ScrollArea className="h-40 border rounded-lg p-2">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Камеры не найдены</p>
          ) : (
            filtered.map(camera => (
              <div
                key={camera.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted transition-colors ${selectedIds.includes(camera.id) ? 'bg-muted' : ''}`}
                onClick={() => onToggle(camera.id)}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 pointer-events-none"
                  checked={selectedIds.includes(camera.id)}
                  readOnly
                />
                <Icon name="Video" size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{camera.name}</span>
                {camera.address && (
                  <span className="text-xs text-muted-foreground truncate ml-auto">{camera.address}</span>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedIds.map(id => {
            const cam = cameras.find(c => c.id === id);
            return cam ? (
              <Badge key={id} variant="secondary" className="text-xs">
                {cam.name}
                <button className="ml-1 hover:text-destructive" onClick={() => onToggle(id)}>×</button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
