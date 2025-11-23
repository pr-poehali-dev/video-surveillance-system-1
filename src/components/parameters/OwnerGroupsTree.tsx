import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export interface OwnerGroup {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children?: OwnerGroup[];
}

const initialGroups: OwnerGroup[] = [
  {
    id: '1',
    name: 'МВД',
    description: 'Министерство внутренних дел',
    parentId: null,
    children: [
      { id: '1-1', name: 'Полиция', parentId: '1', children: [] },
      { id: '1-2', name: 'ГИБДД', parentId: '1', children: [] },
    ],
  },
  {
    id: '2',
    name: 'Администрация',
    description: 'Городская администрация',
    parentId: null,
    children: [
      { id: '2-1', name: 'Центральный район', parentId: '2', children: [] },
      { id: '2-2', name: 'Ленинский район', parentId: '2', children: [] },
    ],
  },
  {
    id: '3',
    name: 'МЧС',
    description: 'Министерство по чрезвычайным ситуациям',
    parentId: null,
    children: [],
  },
];

export const OwnerGroupsTree = () => {
  const [ownerGroups, setOwnerGroups] = useState<OwnerGroup[]>(initialGroups);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1', '2']));
  const [editingGroup, setEditingGroup] = useState<OwnerGroup | null>(null);
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const filterGroups = (groups: OwnerGroup[]): OwnerGroup[] => {
    if (!groupSearchQuery.trim()) return groups;

    const query = groupSearchQuery.toLowerCase();
    const filtered: OwnerGroup[] = [];

    for (const group of groups) {
      const matches = group.name.toLowerCase().includes(query) || 
                      (group.description?.toLowerCase().includes(query) || false);
      const filteredChildren = group.children ? filterGroups(group.children) : [];

      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...group,
          children: filteredChildren.length > 0 ? filteredChildren : group.children,
        });
        if (filteredChildren.length > 0) {
          expandedGroups.add(group.id);
        }
      }
    }

    return filtered;
  };

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  const findGroupById = (groups: OwnerGroup[], id: string): OwnerGroup | null => {
    for (const group of groups) {
      if (group.id === id) return group;
      if (group.children) {
        const found = findGroupById(group.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addChildGroup = (groups: OwnerGroup[], parentId: string, newGroup: OwnerGroup) => {
    for (const group of groups) {
      if (group.id === parentId) {
        if (!group.children) group.children = [];
        group.children.push(newGroup);
        return true;
      }
      if (group.children && addChildGroup(group.children, parentId, newGroup)) {
        return true;
      }
    }
    return false;
  };

  const updateGroup = (groups: OwnerGroup[], id: string, updates: Partial<OwnerGroup>) => {
    for (const group of groups) {
      if (group.id === id) {
        Object.assign(group, updates);
        return true;
      }
      if (group.children && updateGroup(group.children, id, updates)) {
        return true;
      }
    }
    return false;
  };

  const deleteGroup = (groups: OwnerGroup[], id: string): boolean => {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].id === id) {
        groups.splice(i, 1);
        return true;
      }
      if (groups[i].children && deleteGroup(groups[i].children!, id)) {
        return true;
      }
    }
    return false;
  };

  const renderGroupTree = (group: OwnerGroup, level: number) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;

    return (
      <div key={group.id}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleGroup(group.id)}
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
          <Icon name="Folder" size={16} className="text-primary" />
          <div className="flex-1">
            <p className="font-medium">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground">{group.description}</p>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewGroupParentId(group.id);
                setIsAddDialogOpen(true);
              }}
            >
              <Icon name="Plus" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingGroup(group);
                setIsEditDialogOpen(true);
              }}
            >
              <Icon name="Pencil" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (hasChildren) {
                  toast.error('Нельзя удалить группу с подгруппами');
                  return;
                }
                deleteGroup(ownerGroups, group.id);
                setOwnerGroups([...ownerGroups]);
                toast.success('Группа удалена');
              }}
            >
              <Icon name="Trash2" size={14} className="text-destructive" />
            </Button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {group.children!.map(child => renderGroupTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">Реестр собственников камер видеонаблюдения</span>
            <Button onClick={() => { setNewGroupParentId(null); setIsAddDialogOpen(true); }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать группу
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию собственника..."
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {filterGroups(ownerGroups).map(group => renderGroupTree(group, 0))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать группу собственников</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newGroup: OwnerGroup = {
              id: Date.now().toString(),
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              parentId: newGroupParentId,
              children: [],
            };
            
            if (newGroupParentId) {
              addChildGroup(ownerGroups, newGroupParentId, newGroup);
              setOwnerGroups([...ownerGroups]);
            } else {
              setOwnerGroups([...ownerGroups, newGroup]);
            }
            
            setIsAddDialogOpen(false);
            toast.success('Группа создана');
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" placeholder="МВД" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input id="description" name="description" placeholder="Министерство внутренних дел" />
            </div>
            {newGroupParentId && (
              <p className="text-sm text-muted-foreground">
                Будет создана как подгруппа: {findGroupById(ownerGroups, newGroupParentId)?.name}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
              <Button type="submit">Создать</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateGroup(ownerGroups, editingGroup.id, {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
              });
              setOwnerGroups([...ownerGroups]);
              setIsEditDialogOpen(false);
              toast.success('Группа обновлена');
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название <span className="text-red-500">*</span></Label>
                <Input id="edit-name" name="name" defaultValue={editingGroup.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Input id="edit-description" name="description" defaultValue={editingGroup.description} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
