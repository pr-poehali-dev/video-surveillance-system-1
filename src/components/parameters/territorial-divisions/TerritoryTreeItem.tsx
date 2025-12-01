import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Territory } from './types';

interface TerritoryTreeItemProps {
  node: Territory;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (territory: Territory) => void;
  onDelete: (territory: Territory) => void;
}

export const TerritoryTreeItem = ({
  node,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
}: TerritoryTreeItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <div>
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpand(node.id)}
                  className="p-0 h-8 w-8"
                >
                  <Icon
                    name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                    size={18}
                  />
                </Button>
              )}
              {!hasChildren && <div className="w-8" />}
              <div
                className={`w-10 h-10 ${node.color} rounded-full flex items-center justify-center`}
              >
                <Icon name="MapPin" size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{node.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Камер: {node.camera_count}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(node)}
              >
                <Icon name="Pencil" size={14} className="mr-1" />
                Изменить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(node)}
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {hasChildren && isExpanded && (
        <div className="ml-12 mt-2 space-y-2 border-l-2 border-border pl-4">
          {node.children!.map((child) => (
            <TerritoryTreeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
