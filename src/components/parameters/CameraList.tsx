import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Camera,
  CameraModel,
  Owner,
  TerritorialDivision,
  CAMERAS_API,
  MODELS_API,
  OWNERS_API,
  DIVISIONS_API,
} from './camera-list/CameraListTypes';
import { CameraCard } from './camera-list/CameraCard';
import { EditCameraDialog } from './camera-list/EditCameraDialog';
import { DeleteCameraDialog } from './camera-list/DeleteCameraDialog';

interface CameraListProps {
  refreshTrigger?: number;
}

export const CameraList = ({ refreshTrigger }: CameraListProps) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cameraToEdit, setCameraToEdit] = useState<Camera | null>(null);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  const [models, setModels] = useState<CameraModel[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [divisions, setDivisions] = useState<TerritorialDivision[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    rtsp_url: '',
    rtsp_login: '',
    rtsp_password: '',
    model_id: '',
    owner: '',
    address: '',
    latitude: '',
    longitude: '',
    territorial_division: '',
    archive_depth_days: '30',
  });

  useEffect(() => {
    fetchCameras();
    fetchModels();
    fetchOwners();
    fetchDivisions();
  }, [refreshTrigger]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch(CAMERAS_API);
      if (!response.ok) throw new Error('Failed to fetch cameras');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error('Ошибка загрузки камер');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(MODELS_API);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
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

  const handleEdit = (camera: Camera) => {
    setCameraToEdit(camera);
    setFormData({
      name: camera.name,
      rtsp_url: camera.rtsp_url,
      rtsp_login: camera.rtsp_login || '',
      rtsp_password: camera.rtsp_password || '',
      model_id: camera.model_id?.toString() || '',
      owner: camera.owner || '',
      address: camera.address || '',
      latitude: camera.latitude?.toString() || '',
      longitude: camera.longitude?.toString() || '',
      territorial_division: camera.territorial_division || '',
      archive_depth_days: camera.archive_depth_days?.toString() || '30',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraToEdit) return;

    try {
      const payload = {
        id: cameraToEdit.id,
        ...formData,
        model_id: formData.model_id ? parseInt(formData.model_id) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        archive_depth_days: parseInt(formData.archive_depth_days),
      };

      const response = await fetch(CAMERAS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update camera');

      toast.success('Камера обновлена');
      setIsEditDialogOpen(false);
      fetchCameras();
    } catch (error) {
      console.error('Error updating camera:', error);
      toast.error('Ошибка обновления камеры');
    }
  };

  const handleDelete = async () => {
    if (!cameraToDelete) return;

    try {
      const response = await fetch(CAMERAS_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cameraToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete camera');

      toast.success('Камера удалена');
      setIsDeleteDialogOpen(false);
      fetchCameras();
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast.error('Ошибка удаления камеры');
    }
  };

  const filteredCameras = cameras.filter((camera) => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address?.toLowerCase().includes(query) ||
      camera.owner?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск по названию, адресу, собственнику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          {filteredCameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onEdit={handleEdit}
              onDelete={(camera) => {
                setCameraToDelete(camera);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))}

          {filteredCameras.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Camera" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Камеры не найдены</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <EditCameraDialog
        open={isEditDialogOpen}
        camera={cameraToEdit}
        formData={formData}
        models={models}
        owners={owners}
        divisions={divisions}
        onOpenChange={setIsEditDialogOpen}
        onFormDataChange={setFormData}
        onSubmit={handleUpdate}
      />

      <DeleteCameraDialog
        open={isDeleteDialogOpen}
        camera={cameraToDelete}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};
