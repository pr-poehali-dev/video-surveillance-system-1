import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface CameraListProps {
  refreshTrigger?: number;
}

export const CameraList = ({ refreshTrigger }: CameraListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск по названию, адресу, собственнику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          <div className="text-center py-12">
            <Icon name="Camera" size={64} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Камеры не найдены</p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};
