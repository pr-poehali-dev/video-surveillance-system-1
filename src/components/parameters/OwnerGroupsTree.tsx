import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { OwnerGroupTreeItem } from './OwnerGroupTreeItem';
import { OwnerGroupFormDialog } from './OwnerGroupFormDialog';
import { OwnerGroupDeleteDialog } from './OwnerGroupDeleteDialog';

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

  const renderGroupTree = (group: OwnerGroup, level: number): React.ReactNode => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;

    return (
      <OwnerGroupTreeItem
        key={group.id}
        group={group}
        level={level}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={toggleGroup}
        onEdit={(g) => {
          setEditingGroup(g);
          setFormData({
            name: g.name,
            description: g.description || '',
            responsible_full_name: g.responsible_full_name || '',
            responsible_phone: g.responsible_phone || '',
            responsible_email: g.responsible_email || '',
            responsible_position: g.responsible_position || '',
          });
          setIsEditDialogOpen(true);
        }}
        onAddChild={(parentId) => {
          setNewGroupParentId(parentId);
          setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
          setIsAddDialogOpen(true);
        }}
        onDelete={(g) => {
          setGroupToDelete(g);
          setIsDeleteDialogOpen(true);
        }}
        renderChildren={renderGroupTree}
      />
    );
  };

  const tree = buildTree(ownerGroups);
  const filteredTree = filterGroups(tree);

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={24} />
              Собственники камер
            </CardTitle>
            <Button
              onClick={() => {
                setNewGroupParentId(null);
                setFormData({ name: '', description: '', responsible_full_name: '', responsible_phone: '', responsible_email: '', responsible_position: '' });
                setIsAddDialogOpen(true);
              }}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить собственника
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск собственника..."
                className="pl-10"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Building2" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {groupSearchQuery ? 'Ничего не найдено' : 'Собственники не добавлены'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {groupSearchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Добавьте первого собственника для начала работы'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTree.map((group) => renderGroupTree(group, 0))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <OwnerGroupFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setNewGroupParentId(null);
        }}
        onSubmit={handleAdd}
        formData={formData}
        onFormChange={handleFormChange}
        title="Добавить собственника"
        submitLabel="Создать"
      />

      <OwnerGroupFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleEdit}
        formData={formData}
        onFormChange={handleFormChange}
        title="Редактировать собственника"
        submitLabel="Сохранить"
      />

      <OwnerGroupDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={handleDelete}
        group={groupToDelete}
      />
    </>
  );
};
