import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { LayoutConfig } from './types';

interface LayoutSidebarProps {
  layouts: LayoutConfig[];
  selectedLayout: LayoutConfig | null;
  onSelect: (layout: LayoutConfig) => void;
  onShare: (layout: LayoutConfig) => void;
  onDelete: (layout: LayoutConfig) => void;
}

export const LayoutSidebar = ({ layouts, selectedLayout, onSelect, onShare, onDelete }: LayoutSidebarProps) => {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Мои раскладки</h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {layouts.map((layout) => (
              <Card
                key={layout.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLayout?.id === layout.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect(layout)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{layout.name}</h4>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(layout);
                        }}
                      >
                        <Icon name="Share2" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(layout);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Icon name="Grid3x3" size={12} className="mr-1" />
                    {layout.grid} камер
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
};
