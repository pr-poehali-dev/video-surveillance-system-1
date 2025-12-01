import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Territory {
  id: number;
  name: string;
  camera_count: number;
  created_at?: string;
  updated_at?: string;
}

const API_URL = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';

const TerritorialDivisions = () => {
  const [divisions, setDivisions] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    camera_count: 0,
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      camera_count: 0,
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
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (territory: Territory) => {
    setTerritoryToDelete(territory);
    setIsDeleteDialogOpen(true);
  };

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
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {divisions.map((division) => (
              <Card key={division.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Icon name="MapPin" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{division.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Камер: {division.camera_count}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(division)}
                      >
                        <Icon name="Pencil" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(division)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
