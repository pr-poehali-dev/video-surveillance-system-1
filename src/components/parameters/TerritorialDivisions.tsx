import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Territory {
  id: number;
  name: string;
  camera_count: number;
  parent_id: number | null;
  color: string;
  created_at?: string;
  updated_at?: string;
  children?: Territory[];
}

const API_URL = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';

const TerritorialDivisions = () => {
  const [divisions, setDivisions] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([1, 2]));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    camera_count: 0,
    parent_id: null as number | null,
    color: 'bg-blue-500',
  });

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Синий' },
    { value: 'bg-green-500', label: 'Зелёный' },
    { value: 'bg-orange-500', label: 'Оранжевый' },
    { value: 'bg-red-500', label: 'Красный' },
    { value: 'bg-purple-500', label: 'Фиолетовый' },
    { value: 'bg-pink-500', label: 'Розовый' },
    { value: 'bg-blue-400', label: 'Светло-синий' },
    { value: 'bg-green-400', label: 'Светло-зелёный' },
  ];

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch divisions');
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Ошибка загрузки территорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const filterDivisions = (items: Territory[], query: string): Territory[] => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lowerQuery));
  };

  const buildTree = (items: Territory[]): Territory[] => {
    const map = new Map<number, Territory>();
    const roots: Territory[] = [];

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
      camera_count: 0,
      parent_id: null,
      color: 'bg-blue-500',
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          camera_count: formData.camera_count,
          parent_id: formData.parent_id,
          color: formData.color,
        }),
      });

      if (!response.ok) throw new Error('Failed to create division');

      await fetchDivisions();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success(`Территория "${formData.name}" создана`);
    } catch (error) {
      console.error('Error creating division:', error);
      toast.error('Ошибка создания территории');
    }
  };

  const handleEdit = async () => {
    if (!selectedTerritory || !formData.name.trim()) {
      toast.error('Введите название территории');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTerritory.id,
          name: formData.name,
          camera_count: formData.camera_count,
          parent_id: formData.parent_id,
          color: formData.color,
        }),
      });

      if (!response.ok) throw new Error('Failed to update division');

      await fetchDivisions();
      setIsEditDialogOpen(false);
      setSelectedTerritory(null);
      resetForm();
      toast.success('Территория обновлена');
    } catch (error) {
      console.error('Error updating division:', error);
      toast.error('Ошибка обновления территории');
    }
  };

  const handleDelete = async () => {
    if (!territoryToDelete) return;

    const hasChildren = divisions.some((d) => d.parent_id === territoryToDelete.id);
    if (hasChildren) {
      toast.error('Удалите сначала все дочерние территории');
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: territoryToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete division');

      await fetchDivisions();
      setIsDeleteDialogOpen(false);
      toast.success(`Территория "${territoryToDelete.name}" удалена`);
      setTerritoryToDelete(null);
    } catch (error) {
      console.error('Error deleting division:', error);
      toast.error('Ошибка удаления территории');
    }
  };

  const openEditDialog = (territory: Territory) => {
    setSelectedTerritory(territory);
    setFormData({
      name: territory.name,
      camera_count: territory.camera_count,
      parent_id: territory.parent_id,
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
                      Камер: {node.camera_count}
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

  const filteredDivisions = filterDivisions(divisions, searchQuery);
  const tree = buildTree(filteredDivisions);
  const rootDivisions = divisions.filter((d) => d.parent_id === null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MapPin" size={20} />
            Территориальные деления
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="MapPin" size={20} />
            Территориальные деления
          </CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить территорию
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск территории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <Icon name="X" size={16} />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {filteredDivisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Территории не найдены' : 'Нет территорий'}
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Название территории *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Центральный район"
              />
            </div>
            <div>
              <Label htmlFor="create-parent">Родительская территория</Label>
              <Select
                value={formData.parent_id?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger id="create-parent">
                  <SelectValue placeholder="Без родительской территории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без родительской территории</SelectItem>
                  {rootDivisions.map((division) => (
                    <SelectItem key={division.id} value={division.id.toString()}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-color">Цвет</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="create-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${option.value} rounded`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-cameras">Количество камер</Label>
              <Input
                id="create-cameras"
                type="number"
                value={formData.camera_count}
                onChange={(e) =>
                  setFormData({ ...formData, camera_count: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreate}>Создать</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Название территории *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-parent">Родительская территория</Label>
              <Select
                value={formData.parent_id?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="Без родительской территории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без родительской территории</SelectItem>
                  {rootDivisions
                    .filter((d) => d.id !== selectedTerritory?.id)
                    .map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-color">Цвет</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="edit-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${option.value} rounded`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-cameras">Количество камер</Label>
              <Input
                id="edit-cameras"
                type="number"
                value={formData.camera_count}
                onChange={(e) =>
                  setFormData({ ...formData, camera_count: parseInt(e.target.value) || 0 })
                }
              />
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
            <AlertDialogTitle>Удалить территорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить территорию "{territoryToDelete?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TerritorialDivisions;