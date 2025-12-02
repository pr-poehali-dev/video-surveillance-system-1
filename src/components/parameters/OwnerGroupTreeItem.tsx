import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { OwnerGroup } from './OwnerGroupsTree';

interface OwnerGroupTreeItemProps {
  group: OwnerGroup;
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: (id: number) => void;
  onEdit: (group: OwnerGroup) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (group: OwnerGroup) => void;
  renderChildren: (group: OwnerGroup, level: number) => React.ReactNode;
}

export const OwnerGroupTreeItem = ({
  group,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onEdit,
  onAddChild,
  onDelete,
  renderChildren,
}: OwnerGroupTreeItemProps) => {
  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(group.id)}
            className="p-0.5 hover:bg-muted rounded"
          >
            <Icon
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              size={16}
              className="text-muted-foreground"
            />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <Icon name="Building2" size={18} className="text-primary flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{group.name}</div>
          {group.description && (
            <div className="text-xs text-muted-foreground truncate">{group.description}</div>
          )}
          {group.responsible_full_name && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Icon name="User" size={12} />
              <span>{group.responsible_full_name}</span>
              {group.responsible_position && <span className="text-muted-foreground/70">• {group.responsible_position}</span>}
            </div>
          )}
          {(group.responsible_phone || group.responsible_email) && (
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              {group.responsible_phone && (
                <span className="flex items-center gap-1">
                  <Icon name="Phone" size={12} />
                  {group.responsible_phone}
                </span>
              )}
              {group.responsible_email && (
                <span className="flex items-center gap-1">
                  <Icon name="Mail" size={12} />
                  {group.responsible_email}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(group)}
            className="h-7 w-7 p-0"
          >
            <Icon name="Pencil" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(group.id)}
            className="h-7 w-7 p-0"
          >
            <Icon name="Plus" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(group)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {group.children?.map((child) => renderChildren(child, level + 1))}
        </div>
      )}
    </div>
  );
};
