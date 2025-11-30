import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface UserGroup {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  userCount: number;
}

const UserGroupsTab = () => {
  const [groups, setGroups] = useState<UserGroup[]>([
    { id: 1, name: 'МВД', description: 'Министерство внутренних дел', parentId: null, userCount: 5 },
    { id: 2, name: 'Отдел мониторинга', description: 'Отдел круглосуточного мониторинга', parentId: 1, userCount: 3 },
    { id: 3, name: 'Дежурная часть', description: 'Дежурная часть МВД', parentId: 1, userCount: 2 },
    { id: 4, name: 'Администрация', description: 'Администрация Пермского края', parentId: null, userCount: 8 },
    { id: 5, name: 'Отдел безопасности', description: 'Отдел по безопасности', parentId: 4, userCount: 4 },
  ]);

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1, 4]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const toggleExpand = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getChildGroups = (parentId: number | null) => {
    return groups.filter(g => g.parentId === parentId);
  };

  const hasChildren = (groupId: number) => {
    return groups.some(g => g.parentId === groupId);
  };

  const handleCreateGroup = () => {
    const newGroup: UserGroup = {
      id: Math.max(...groups.map(g => g.id)) + 1,
      name: formData.name,
      description: formData.description,
      parentId: selectedParentId,
      userCount: 0,
    };
    setGroups([...groups, newGroup]);
    setFormData({ name: '', description: '' });
    setSelectedParentId(null);
    setIsCreateDialogOpen(false);
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;
    setGroups(groups.map(g => 
      g.id === selectedGroup.id 
        ? { ...g, name: formData.name, description: formData.description }
        : g
    ));
    setFormData({ name: '', description: '' });
    setSelectedGroup(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    setGroups(groups.filter(g => g.id !== selectedGroup.id && g.parentId !== selectedGroup.id));
    setSelectedGroup(null);
    setIsDeleteDialogOpen(false);
  };

  const openCreateDialog = (parentId: number | null = null) => {
    setSelectedParentId(parentId);
    setFormData({ name: '', description: '' });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (group: UserGroup) => {
    setSelectedGroup(group);
    setFormData({ name: group.name, description: group.description });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const renderGroup = (group: UserGroup, level: number = 0) => {
    const children = getChildGroups(group.id);
    const isExpanded = expandedGroups.has(group.id);
    const hasChildGroups = hasChildren(group.id);

    return (
      <div key={group.id}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1" style={{ paddingLeft: `${level * 24}px` }}>
                {hasChildGroups && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(group.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
                  </Button>
                )}
                {!hasChildGroups && <div className="w-6" />}
                <Icon name="FolderTree" size={18} className="text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {group.userCount} польз.
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openCreateDialog(group.id)}
                  title="Добавить подгруппу"
                >
                  <Icon name="Plus" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(group)}
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(group)}
                  title="Удалить"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {isExpanded && children.map(child => renderGroup(child, level + 1))}
      </div>
    );
  };

  const rootGroups = getChildGroups(null);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="Users" size={20} />
                Группы пользователей
              </h3>
              <p className="text-sm text-muted-foreground">
                Иерархическая структура групп для организации доступа
              </p>
            </div>
            <Button onClick={() => openCreateDialog()}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать корневую группу
            </Button>
          </div>

          <div className="space-y-2">
            {rootGroups.map(group => renderGroup(group))}
          </div>

          {rootGroups.length === 0 && (
            <div className="text-center py-12">
              <Icon name="FolderTree" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Группы не созданы</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первую группу для организации пользователей
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать группу</DialogTitle>
            <DialogDescription>
              {selectedParentId 
                ? `Создание подгруппы в "${groups.find(g => g.id === selectedParentId)?.name}"`
                : 'Создание корневой группы'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Название группы *</Label>
              <Input
                id="group-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Описание</Label>
              <Input
                id="group-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateGroup} disabled={!formData.name}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
            <DialogDescription>
              Изменение информации о группе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Название группы *</Label>
              <Input
                id="edit-group-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-description">Описание</Label>
              <Input
                id="edit-group-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditGroup} disabled={!formData.name}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить группу "{selectedGroup?.name}"? 
              Все подгруппы также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserGroupsTab;