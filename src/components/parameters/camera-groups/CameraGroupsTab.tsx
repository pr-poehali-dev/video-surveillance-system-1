import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const GROUPS_API = 'https://functions.poehali.dev/90109919-f443-4ada-9135-696710aa2338';
const CAMERAS_API = 'https://functions.poehali.dev/712d5c60-998d-49d9-8252-705500df28c7';
const OWNERS_API = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';
const DIVISIONS_API = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';

interface Camera {
  id: number;
  name: string;
  address: string;
  owner: string;
  territorial_division: string;
}

interface CameraGroup {
  id: number;
  name: string;
  description: string;
  camera_ids: number[];
}

interface Owner {
  id: number;
  name: string;
}

interface Division {
  id: number;
  name: string;
}

const CameraGroupsTab = () => {
  const [groups, setGroups] = useState<CameraGroup[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CameraGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<CameraGroup | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    camera_ids: [] as number[],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchGroups(),
      fetchCameras(),
      fetchOwners(),
      fetchDivisions(),
    ]);
    setLoading(false);
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(GROUPS_API);
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Ошибка загрузки групп');
    }
  };

  const fetchCameras = async () => {
    try {
      const response = await fetch(CAMERAS_API);
      if (!response.ok) throw new Error('Failed to fetch cameras');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error('Ошибка загрузки камер');
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await fetch(OWNERS_API);
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch(DIVISIONS_API);
      if (response.ok) {
        const data = await response.json();
        setDivisions(data);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      camera_ids: [],
    });
    setSearchQuery('');
    setSelectedOwner('');
    setSelectedDivision('');
  };

  const toggleCamera = (cameraId: number) => {
    setFormData(prev => ({
      ...prev,
      camera_ids: prev.camera_ids.includes(cameraId)
        ? prev.camera_ids.filter(id => id !== cameraId)
        : [...prev.camera_ids, cameraId]
    }));
  };

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = !selectedOwner || camera.owner === selectedOwner;
    const matchesDivision = !selectedDivision || camera.territorial_division === selectedDivision;
    
    return matchesSearch && matchesOwner && matchesDivision;
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    try {
      const response = await fetch(GROUPS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create group');

      toast.success(`Группа "${formData.name}" создана`);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Ошибка создания группы');
    }
  };

  const handleEdit = async () => {
    if (!selectedGroup || !formData.name.trim()) {
      toast.error('Введите название группы');
      return;
    }

    try {
      const response = await fetch(GROUPS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGroup.id, ...formData }),
      });

      if (!response.ok) throw new Error('Failed to update group');

      toast.success('Группа обновлена');
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Ошибка обновления группы');
    }
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(GROUPS_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete group');

      toast.success(`Группа "${groupToDelete.name}" удалена`);
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Ошибка удаления группы');
    }
  };

  const openEditDialog = (group: CameraGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      camera_ids: group.camera_ids || [],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (group: CameraGroup) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <Card key={group.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <Badge variant="secondary">
                        <Icon name="Camera" size={12} className="mr-1" />
                        {group.camera_ids?.length || 0} камер
                      </Badge>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">
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
                Создать группу
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать группу камер</DialogTitle>
            <DialogDescription>
              Выберите камеры для новой группы
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название группы <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание группы (опционально)"
                rows={3}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Камеры в группе</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Поиск по названию/адресу</Label>
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Фильтр по собственнику</Label>
                  <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все собственники" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все собственники</SelectItem>
                      {owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.name}>
                          {owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Фильтр по территории</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все территории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все территории</SelectItem>
                      {divisions.map(division => (
                        <SelectItem key={division.id} value={division.name}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-2">
                  {filteredCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md"
                    >
                      <Checkbox
                        checked={formData.camera_ids.includes(camera.id)}
                        onCheckedChange={() => toggleCamera(camera.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{camera.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{camera.address}</p>
                      </div>
                    </div>
                  ))}
                  {filteredCameras.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Камеры не найдены
                    </p>
                  )}
                </div>
              </ScrollArea>

              <p className="text-sm text-muted-foreground">
                Выбрано: {formData.camera_ids.length} камер
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleCreate}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
            <DialogDescription>
              Измените данные группы камер
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название группы <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание группы (опционально)"
                rows={3}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Камеры в группе</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Поиск по названию/адресу</Label>
                  <div className="relative">
                    <Icon name="Search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Фильтр по собственнику</Label>
                  <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все собственники" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все собственники</SelectItem>
                      {owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.name}>
                          {owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Фильтр по территории</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все территории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все территории</SelectItem>
                      {divisions.map(division => (
                        <SelectItem key={division.id} value={division.name}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-2">
                  {filteredCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md"
                    >
                      <Checkbox
                        checked={formData.camera_ids.includes(camera.id)}
                        onCheckedChange={() => toggleCamera(camera.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{camera.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{camera.address}</p>
                      </div>
                    </div>
                  ))}
                  {filteredCameras.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Камеры не найдены
                    </p>
                  )}
                </div>
              </ScrollArea>

              <p className="text-sm text-muted-foreground">
                Выбрано: {formData.camera_ids.length} камер
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedGroup(null); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleEdit}>
              <Icon name="Save" size={18} className="mr-2" />
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
              Вы действительно хотите удалить группу "{groupToDelete?.name}"?
              Камеры останутся в системе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CameraGroupsTab;
