import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { CameraGroupCard } from './CameraGroupCard';
import { CameraGroupFormDialog } from './CameraGroupFormDialog';
import { CameraGroupDeleteDialog } from './CameraGroupDeleteDialog';

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

interface CameraGroupsTabProps {
  onCreateClick: () => void;
}

const CameraGroupsTab = ({ onCreateClick }: CameraGroupsTabProps) => {
  const [groups, setGroups] = useState<CameraGroup[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupSearchQuery, setGroupSearchQuery] = useState('');
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

  const handleCreateCancel = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedGroup(null);
    resetForm();
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
    onCreateClick();
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск группы по названию..."
            value={groupSearchQuery}
            onChange={(e) => setGroupSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {filteredGroups.map((group) => (
            <CameraGroupCard
              key={group.id}
              group={group}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}

          {filteredGroups.length === 0 && groups.length > 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Группы не найдены по запросу
              </p>
            </div>
          )}

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

      <CameraGroupFormDialog
        open={isCreateDialogOpen}
        isEdit={false}
        formData={formData}
        cameras={cameras}
        owners={owners}
        divisions={divisions}
        searchQuery={searchQuery}
        selectedOwner={selectedOwner}
        selectedDivision={selectedDivision}
        onOpenChange={setIsCreateDialogOpen}
        onFormDataChange={setFormData}
        onSearchChange={setSearchQuery}
        onOwnerChange={setSelectedOwner}
        onDivisionChange={setSelectedDivision}
        onToggleCamera={toggleCamera}
        onSubmit={handleCreate}
        onCancel={handleCreateCancel}
      />

      <CameraGroupFormDialog
        open={isEditDialogOpen}
        isEdit={true}
        formData={formData}
        cameras={cameras}
        owners={owners}
        divisions={divisions}
        searchQuery={searchQuery}
        selectedOwner={selectedOwner}
        selectedDivision={selectedDivision}
        onOpenChange={setIsEditDialogOpen}
        onFormDataChange={setFormData}
        onSearchChange={setSearchQuery}
        onOwnerChange={setSelectedOwner}
        onDivisionChange={setSelectedDivision}
        onToggleCamera={toggleCamera}
        onSubmit={handleEdit}
        onCancel={handleEditCancel}
      />

      <CameraGroupDeleteDialog
        open={isDeleteDialogOpen}
        group={groupToDelete}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default CameraGroupsTab;