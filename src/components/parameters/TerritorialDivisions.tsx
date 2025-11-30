import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';

interface Territory {
  id: number;
  name: string;
  parentId: number | null;
  cameras: number;
  color: string;
  children?: Territory[];
}

const TerritorialDivisions = () => {
  const [divisions, setDivisions] = useState<Territory[]>([
    { id: 1, name: 'Центральный район', parentId: null, cameras: 245, color: 'bg-blue-500' },
    { id: 2, name: 'Ленинский район', parentId: null, cameras: 312, color: 'bg-green-500' },
    { id: 3, name: 'Дзержинский район', parentId: null, cameras: 198, color: 'bg-orange-500' },
    { id: 4, name: 'Свердловский район', parentId: null, cameras: 267, color: 'bg-purple-500' },
    { id: 5, name: 'Мотовилихинский район', parentId: null, cameras: 225, color: 'bg-red-500' },
    { id: 6, name: 'Центр', parentId: 1, cameras: 120, color: 'bg-blue-400' },
    { id: 7, name: 'Окраина', parentId: 1, cameras: 125, color: 'bg-blue-300' },
    { id: 8, name: 'Северная часть', parentId: 2, cameras: 180, color: 'bg-green-400' },
    { id: 9, name: 'Южная часть', parentId: 2, cameras: 132, color: 'bg-green-300' },
  ]);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([1, 2]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: null as number | null,
    cameras: 0,
    color: 'bg-blue-500',
  });

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Синий' },
    { value: 'bg-green-500', label: 'Зелёный' },
    { value: 'bg-orange-500', label: 'Оранжевый' },
    { value: 'bg-red-500', label: 'Красный' },
    { value: 'bg-purple-500', label: 'Фиолетовый' },
    { value: 'bg-pink-500', label: 'Розовый' },
  ];

  const buildTree = (items: Territory[]): Territory[] => {
    const map = new Map<number, Territory>();
    const roots: Territory[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId === null) {
        roots.push(node);
      } else {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children!.push(node);
        }
      }
    });

    return roots;
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parentId: null,
      cameras: 0,
      color: 'bg-blue-500',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    const newTerritory: Territory = {
      id: Math.max(0, ...divisions.map((d) => d.id)) + 1,
      name: formData.name,
      parentId: formData.parentId,
      cameras: formData.cameras,
      color: formData.color,
    };

    setDivisions([...divisions, newTerritory]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success(`Территория "${newTerritory.name}" создана`);
  };

  const handleEdit = () => {
    if (!selectedTerritory || !formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    setDivisions(
      divisions.map((div) =>
        div.id === selectedTerritory.id
          ? {
              ...div,
              name: formData.name,
              parentId: formData.parentId,
              cameras: formData.cameras,
              color: formData.color,
            }
          : div
      )
    );

    setIsEditDialogOpen(false);
    setSelectedTerritory(null);
    resetForm();
    toast.success('Территория обновлена');
  };

  const handleDelete = () => {
    if (!territoryToDelete) return;

    const hasChildren = divisions.some((d) => d.parentId === territoryToDelete.id);
    if (hasChildren) {
      toast.error('Удалите сначала все дочерние территории');
      return;
    }

    setDivisions(divisions.filter((d) => d.id !== territoryToDelete.id));
    setIsDeleteDialogOpen(false);
    toast.success(`Территория "${territoryToDelete.name}" удалена`);
    setTerritoryToDelete(null);
  };

  const openEditDialog = (territory: Territory) => {
    setSelectedTerritory(territory);
    setFormData({
      name: territory.name,
      parentId: territory.parentId,
      cameras: territory.cameras,
      color: territory.color,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (territory: Territory) => {
    setTerritoryToDelete(territory);
    setIsDeleteDialogOpen(true);
  };

  const renderTree = (nodes: Territory[], level: number = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedIds.has(node.id);

      return (
        <div key={node.id}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(node.id)}
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
                      Камер: {node.cameras}
                      {level > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          Уровень {level + 1}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(node)}
                  >
                    <Icon name="Pencil" size={14} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(node)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {hasChildren && isExpanded && (
            <div className="ml-12 mt-2 space-y-2 border-l-2 border-border pl-4">
              {renderTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const tree = buildTree(divisions);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="MapPinned" size={20} />
              Территориальные деления
            </CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить территорию
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">{renderTree(tree)}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Введите название территории"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Родительская территория</Label>
              <Select
                value={formData.parentId?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительскую территорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Корневой уровень</SelectItem>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Количество камер</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.cameras}
                onChange={(e) => setFormData({ ...formData, cameras: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Цвет маркера</Label>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-10 h-10 ${option.value} rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-foreground scale-110'
                        : 'border-border'
                    }`}
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleCreate} className="flex-1">
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Введите название территории"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Родительская территория</Label>
              <Select
                value={formData.parentId?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительскую территорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Корневой уровень</SelectItem>
                  {divisions
                    .filter((div) => div.id !== selectedTerritory?.id)
                    .map((div) => (
                      <SelectItem key={div.id} value={div.id.toString()}>
                        {div.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Количество камер</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.cameras}
                onChange={(e) => setFormData({ ...formData, cameras: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Цвет маркера</Label>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-10 h-10 ${option.value} rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-foreground scale-110'
                        : 'border-border'
                    }`}
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleEdit} className="flex-1">
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить территорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить территорию "{territoryToDelete?.name}"?
              {divisions.some((d) => d.parentId === territoryToDelete?.id) &&
                ' У этой территории есть дочерние деления. Сначала удалите их.'}
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

export default TerritorialDivisions;