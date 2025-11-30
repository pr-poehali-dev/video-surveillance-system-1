import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useTrashStore } from '@/stores/trashStore';

interface Camera {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface CameraGroup {
  id: number;
  name: string;
  description: string;
  cameraIds: number[];
  color: string;
}

const CameraGroupsTab = () => {
  const { addToTrash } = useTrashStore();
  const availableCameras: Camera[] = [
    { id: 1, name: 'Камера-001', address: 'ул. Ленина, 50', status: 'active' },
    { id: 2, name: 'Камера-002', address: 'ул. Мира, 15', status: 'active' },
    { id: 3, name: 'Камера-003', address: 'ул. Сибирская, 27', status: 'problem' },
    { id: 4, name: 'Камера-004', address: 'Комсомольский пр., 68', status: 'active' },
    { id: 5, name: 'Камера-005', address: 'ул. Петропавловская, 35', status: 'inactive' },
    { id: 6, name: 'Камера-006', address: 'ул. Куйбышева, 95', status: 'active' },
  ];

  const [groups, setGroups] = useState<CameraGroup[]>([
    {
      id: 1,
      name: 'Центр города',
      description: 'Камеры в центральных районах',
      cameraIds: [1, 2, 4],
      color: '#3b82f6',
    },
    {
      id: 2,
      name: 'Периферия',
      description: 'Камеры в окраинных районах',
      cameraIds: [5, 6],
      color: '#10b981',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CameraGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<CameraGroup | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    cameraIds: [] as number[],
  });

  const colorOptions = [
    { value: '#3b82f6', label: 'Синий' },
    { value: '#10b981', label: 'Зелёный' },
    { value: '#f59e0b', label: 'Оранжевый' },
    { value: '#ef4444', label: 'Красный' },
    { value: '#8b5cf6', label: 'Фиолетовый' },
    { value: '#ec4899', label: 'Розовый' },
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      cameraIds: [],
    });
    setSearchQuery('');
  };

  const toggleCamera = (cameraId: number) => {
    setFormData(prev => ({
      ...prev,
      cameraIds: prev.cameraIds.includes(cameraId)
        ? prev.cameraIds.filter(id => id !== cameraId)
        : [...prev.cameraIds, cameraId]
    }));
  };

  const filteredCameras = availableCameras.filter(camera =>
    camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    const newGroup: CameraGroup = {
      id: Math.max(0, ...groups.map((g) => g.id)) + 1,
      name: formData.name,
      description: formData.description,
      cameraIds: formData.cameraIds,
      color: formData.color,
    };

    setGroups([...groups, newGroup]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success(`Группа "${newGroup.name}" создана`);
  };

  const handleEdit = () => {
    if (!selectedGroup || !formData.name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    setGroups(
      groups.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              name: formData.name,
              description: formData.description,
              cameraIds: formData.cameraIds,
              color: formData.color,
            }
          : group
      )
    );

    setIsEditDialogOpen(false);
    setSelectedGroup(null);
    resetForm();
    toast.success('Группа обновлена');
  };

  const handleDelete = () => {
    if (!groupToDelete) return;

    addToTrash('cameraGroup', groupToDelete);
    setGroups(groups.filter((g) => g.id !== groupToDelete.id));
    setIsDeleteDialogOpen(false);
    toast.success(`Группа "${groupToDelete.name}" перемещена в корзину`);
    setGroupToDelete(null);
  };

  const openEditDialog = (group: CameraGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      color: group.color,
      cameraIds: group.cameraIds,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (group: CameraGroup) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Управление группами камер для удобной организации
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать группу
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="border-l-4" style={{ borderLeftColor: group.color }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <Badge variant="secondary">
                        <Icon name="Camera" size={12} className="mr-1" />
                        {group.cameraIds.length} камер
                      </Badge>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground ml-7">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(group)}
                    >
                      <Icon name="Pencil" size={16} className="mr-2" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(group)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {groups.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Layers" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Группы камер не созданы
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать первую группу
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать группу камер</DialogTitle>
            <DialogDescription>
              Создайте новую группу для организации камер
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Введите название группы"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Описание группы (необязательно)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Цвет группы</Label>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-foreground scale-110'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Камеры в группе</Label>
              <div className="relative mb-2">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск камер..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[200px] border rounded-lg p-2">
                <div className="space-y-2">
                  {filteredCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => toggleCamera(camera.id)}
                    >
                      <Checkbox
                        checked={formData.cameraIds.includes(camera.id)}
                        onCheckedChange={() => toggleCamera(camera.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{camera.name}</p>
                        <p className="text-xs text-muted-foreground">{camera.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-1">
                Выбрано: {formData.cameraIds.length} камер
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
            <DialogDescription>
              Измените параметры группы камер
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Введите название группы"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                placeholder="Описание группы (необязательно)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Цвет группы</Label>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-foreground scale-110'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Камеры в группе</Label>
              <div className="relative mb-2">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск камер..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[200px] border rounded-lg p-2">
                <div className="space-y-2">
                  {filteredCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => toggleCamera(camera.id)}
                    >
                      <Checkbox
                        checked={formData.cameraIds.includes(camera.id)}
                        onCheckedChange={() => toggleCamera(camera.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{camera.name}</p>
                        <p className="text-xs text-muted-foreground">{camera.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-1">
                Выбрано: {formData.cameraIds.length} камер
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить группу "{groupToDelete?.name}"? В этой
              группе {groupToDelete?.cameraIds.length} камер. Камеры не будут удалены, только
              группировка.
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

export default CameraGroupsTab;