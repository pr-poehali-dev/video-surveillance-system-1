import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export interface OwnerGroup {
  id: number;
  name: string;
  description?: string;
  parent_id: number | null;
  children?: OwnerGroup[];
  created_at?: string;
  updated_at?: string;
  responsible_full_name?: string;
  responsible_phone?: string;
  responsible_email?: string;
  responsible_position?: string;
}

const API_URL = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';

export const OwnerGroupsTree = () => {
  const [ownerGroups, setOwnerGroups] = useState<OwnerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<OwnerGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1, 2]));
  const [editingGroup, setEditingGroup] = useState<OwnerGroup | null>(null);
  const [newGroupParentId, setNewGroupParentId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    responsible_full_name: '',
    responsible_phone: '',
    responsible_email: '',
    responsible_position: ''
  });

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch owners');
      const data = await response.json();
      setOwnerGroups(data);
    } catch (error) {
      console.error('Error fetching owners:', error);
      toast.error('Ошибка загрузки собственников');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const buildTree = (items: OwnerGroup[]): OwnerGroup[] => {
    const map = new Map<number, OwnerGroup>();
    const roots: OwnerGroup[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parent_id === null) {
        roots.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          parent.children!.push(node);
        }
      }
    });

    return roots;
  };

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

  const toggleGroup = (id: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Введите название собственника');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          parent_id: newGroupParentId,
          responsible_full_name: formData.responsible_full_name || null,
          responsible_phone: formData.responsible_phone || null,
          responsible_email: formData.responsible_email || null,
          responsible_position: formData.responsible_position || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create owner');

      await fetchOwners();
      setIsAddDialogOpen(false);
      setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
      setNewGroupParentId(null);
      toast.success(`Собственник "${formData.name}" создан`);
    } catch (error) {
      console.error('Error creating owner:', error);
      toast.error('Ошибка создания собственника');
    }
  };

  const handleEdit = async () => {
    if (!editingGroup || !formData.name.trim()) {
      toast.error('Введите название собственника');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGroup.id,
          name: formData.name,
          description: formData.description || null,
          parent_id: editingGroup.parent_id,
          responsible_full_name: formData.responsible_full_name || null,
          responsible_phone: formData.responsible_phone || null,
          responsible_email: formData.responsible_email || null,
          responsible_position: formData.responsible_position || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update owner');

      await fetchOwners();
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
      toast.success('Собственник обновлен');
    } catch (error) {
      console.error('Error updating owner:', error);
      toast.error('Ошибка обновления собственника');
    }
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;

    const hasChildren = ownerGroups.some((g) => g.parent_id === groupToDelete.id);
    if (hasChildren) {
      toast.error('Нельзя удалить группу с подгруппами');
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete owner');

      await fetchOwners();
      setIsDeleteDialogOpen(false);
      toast.success(`Собственник "${groupToDelete.name}" удален`);
      setGroupToDelete(null);
    } catch (error) {
      console.error('Error deleting owner:', error);
      toast.error('Ошибка удаления собственника');
    }
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
                setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
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
                setFormData({ 
                  name: group.name, 
                  description: group.description || '',
                  responsible_full_name: group.responsible_full_name || '',
                  responsible_phone: group.responsible_phone || '',
                  responsible_email: group.responsible_email || '',
                  responsible_position: group.responsible_position || ''
                });
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
                setGroupToDelete(group);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Icon name="Trash2" size={14} />
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

  const tree = buildTree(ownerGroups);
  const filteredTree = filterGroups(tree);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Реестр собственников камер видеонаблюдения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">Реестр собственников камер видеонаблюдения</span>
            <Button onClick={() => { 
              setNewGroupParentId(null); 
              setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
              setIsAddDialogOpen(true); 
            }}>
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
          <ScrollArea className="h-[400px]">
            {filteredTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {groupSearchQuery ? 'Собственники не найдены' : 'Нет собственников'}
              </div>
            ) : (
              filteredTree.map((group) => renderGroupTree(group, 0))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newGroupParentId ? 'Создать подгруппу' : 'Создать группу собственников'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: МВД"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Например: Министерство внутренних дел"
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3 text-sm">Ответственный сотрудник</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="responsible_full_name">ФИО</Label>
                  <Input
                    id="responsible_full_name"
                    value={formData.responsible_full_name}
                    onChange={(e) => setFormData({ ...formData, responsible_full_name: e.target.value })}
                    placeholder="Например: Иванов Иван Иванович"
                  />
                </div>
                <div>
                  <Label htmlFor="responsible_phone">Телефон</Label>
                  <Input
                    id="responsible_phone"
                    value={formData.responsible_phone}
                    onChange={(e) => setFormData({ ...formData, responsible_phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="responsible_email">Email</Label>
                  <Input
                    id="responsible_email"
                    type="email"
                    value={formData.responsible_email}
                    onChange={(e) => setFormData({ ...formData, responsible_email: e.target.value })}
                    placeholder="example@domain.ru"
                  />
                </div>
                <div>
                  <Label htmlFor="responsible_position">Должность</Label>
                  <Input
                    id="responsible_position"
                    value={formData.responsible_position}
                    onChange={(e) => setFormData({ ...formData, responsible_position: e.target.value })}
                    placeholder="Например: Начальник отдела"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAdd}>Создать</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать собственника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Название *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Описание</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3 text-sm">Ответственный сотрудник</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit_responsible_full_name">ФИО</Label>
                  <Input
                    id="edit_responsible_full_name"
                    value={formData.responsible_full_name}
                    onChange={(e) => setFormData({ ...formData, responsible_full_name: e.target.value })}
                    placeholder="Например: Иванов Иван Иванович"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_responsible_phone">Телефон</Label>
                  <Input
                    id="edit_responsible_phone"
                    value={formData.responsible_phone}
                    onChange={(e) => setFormData({ ...formData, responsible_phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_responsible_email">Email</Label>
                  <Input
                    id="edit_responsible_email"
                    type="email"
                    value={formData.responsible_email}
                    onChange={(e) => setFormData({ ...formData, responsible_email: e.target.value })}
                    placeholder="example@domain.ru"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_responsible_position">Должность</Label>
                  <Input
                    id="edit_responsible_position"
                    value={formData.responsible_position}
                    onChange={(e) => setFormData({ ...formData, responsible_position: e.target.value })}
                    placeholder="Например: Начальник отдела"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleEdit}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить собственника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить "{groupToDelete?.name}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};