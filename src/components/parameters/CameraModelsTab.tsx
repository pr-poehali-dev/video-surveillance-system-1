import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
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

interface CameraModel {
  id: number;
  manufacturer: string;
  model_name: string;
  description?: string;
  default_rtsp_port: number;
  default_ptz_port: number;
  supports_ptz: boolean;
}

const API_URL = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';

export const CameraModelsTab = () => {
  const [models, setModels] = useState<CameraModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CameraModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CameraModel | null>(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model_name: '',
    description: '',
    default_rtsp_port: 554,
    default_ptz_port: 8000,
    supports_ptz: false,
  });

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Ошибка загрузки моделей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleAdd = async () => {
    if (!formData.manufacturer.trim() || !formData.model_name.trim()) {
      toast.error('Заполните производителя и модель');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create model');

      await fetchModels();
      setIsAddDialogOpen(false);
      setFormData({
        manufacturer: '',
        model_name: '',
        description: '',
        default_rtsp_port: 554,
        default_ptz_port: 8000,
        supports_ptz: false,
      });
      toast.success('Модель создана');
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Ошибка создания модели');
    }
  };

  const handleEdit = async () => {
    if (!editingModel || !formData.manufacturer.trim() || !formData.model_name.trim()) {
      toast.error('Заполните производителя и модель');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingModel.id }),
      });

      if (!response.ok) throw new Error('Failed to update model');

      await fetchModels();
      setIsEditDialogOpen(false);
      setEditingModel(null);
      toast.success('Модель обновлена');
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Ошибка обновления модели');
    }
  };

  const handleDelete = async () => {
    if (!modelToDelete) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modelToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete model');

      await fetchModels();
      setIsDeleteDialogOpen(false);
      setModelToDelete(null);
      toast.success('Модель удалена');
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Ошибка удаления модели');
    }
  };

  const filteredModels = models.filter(
    (model) =>
      model.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.manufacturer]) {
      acc[model.manufacturer] = [];
    }
    acc[model.manufacturer].push(model);
    return acc;
  }, {} as Record<string, CameraModel[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Модели камер</span>
            <Button
              onClick={() => {
                setFormData({
                  manufacturer: '',
                  model_name: '',
                  description: '',
                  default_rtsp_port: 554,
                  default_ptz_port: 8000,
                  supports_ptz: false,
                });
                setIsAddDialogOpen(true);
              }}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить модель
            </Button>
          </CardTitle>
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
                placeholder="Поиск по производителю или модели..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {Object.keys(groupedModels).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Модели не найдены' : 'Нет моделей'}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedModels).map(([manufacturer, manufacturerModels]) => (
                  <div key={manufacturer}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Factory" size={20} className="text-primary" />
                      {manufacturer}
                    </h3>
                    <div className="space-y-2">
                      {manufacturerModels.map((model) => (
                        <div
                          key={model.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon name="Camera" size={16} className="text-muted-foreground" />
                                <span className="font-medium">{model.model_name}</span>
                                {model.supports_ptz && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    PTZ
                                  </span>
                                )}
                              </div>
                              {model.description && (
                                <p className="text-sm text-muted-foreground">
                                  {model.description}
                                </p>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingModel(model);
                                  setFormData({
                                    manufacturer: model.manufacturer,
                                    model_name: model.model_name,
                                    description: model.description || '',
                                    default_rtsp_port: model.default_rtsp_port,
                                    default_ptz_port: model.default_ptz_port,
                                    supports_ptz: model.supports_ptz,
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
                                  setModelToDelete(model);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить модель камеры</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="manufacturer">Производитель *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Hikvision"
              />
            </div>
            <div>
              <Label htmlFor="model_name">Модель *</Label>
              <Input
                id="model_name"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                placeholder="DS-2CD2143G0-I"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="IP-камера 4Мп с ИК-подсветкой"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="supports_ptz"
                checked={formData.supports_ptz}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, supports_ptz: checked as boolean })
                }
              />
              <Label htmlFor="supports_ptz" className="cursor-pointer">
                Поддержка PTZ
              </Label>
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
            <DialogTitle>Редактировать модель</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-manufacturer">Производитель *</Label>
              <Input
                id="edit-manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-model_name">Модель *</Label>
              <Input
                id="edit-model_name"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-supports_ptz"
                checked={formData.supports_ptz}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, supports_ptz: checked as boolean })
                }
              />
              <Label htmlFor="edit-supports_ptz" className="cursor-pointer">
                Поддержка PTZ
              </Label>
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
            <AlertDialogTitle>Удалить модель?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить модель "{modelToDelete?.manufacturer}{' '}
              {modelToDelete?.model_name}"? Это действие нельзя отменить.
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