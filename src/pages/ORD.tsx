import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { StatsCards } from '@/components/ord/StatsCards';
import { OnlineFaceTab } from '@/components/ord/OnlineFaceTab';
import { OnlinePlateTab } from '@/components/ord/OnlinePlateTab';
import { HistoryFaceTab } from '@/components/ord/HistoryFaceTab';
import { HistoryPlateTab } from '@/components/ord/HistoryPlateTab';
import { CameraOption } from '@/components/ord/CameraMultiSelect';
import { CAMERAS_API } from '@/components/parameters/camera-list/CameraListTypes';

const ORD = () => {
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreatePlateFormOpen, setIsCreatePlateFormOpen] = useState(false);
  const [faceEmails, setFaceEmails] = useState<string[]>(['']);
  const [faceMaxNicknames, setFaceMaxNicknames] = useState<string[]>(['']);
  const [plateEmails, setPlateEmails] = useState<string[]>(['']);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<number[]>([]);
  const [selectedPlateCameraIds, setSelectedPlateCameraIds] = useState<number[]>([]);

  useEffect(() => {
    fetch(CAMERAS_API)
      .then(r => r.json())
      .then(data => setCameras(Array.isArray(data) ? data : []))
      .catch(() => setCameras([]));
  }, []);

  const toggleCamera = (id: number) => {
    setSelectedCameraIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePlateCamera = (id: number) => {
    setSelectedPlateCameraIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      toast.success(`Загружено ${files.length} изображений`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      toast.success(`Загружено ${files.length} изображений`);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    toast.info('Изображение удалено');
  };

  const handlePlateSearch = () => {
    if (plateSearch) {
      toast.success('Поиск ГРЗ начат');
    }
  };

  const stats = {
    faces24h: 45832,
    people24h: 52391,
    vehicles24h: 18492,
    plates24h: 16847,
  };

  const mockResults = [
    {
      id: 1,
      type: 'face' as const,
      match: 94.5,
      time: '2024-11-21 14:32:15',
      camera: 'Камера-001',
      address: 'ул. Ленина, 50',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      type: 'plate' as const,
      match: 98.2,
      time: '2024-11-21 14:28:43',
      camera: 'Камера-003',
      address: 'ул. Сибирская, 27',
      plate: 'А123ВС159',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      type: 'face' as const,
      match: 87.3,
      time: '2024-11-21 14:15:22',
      camera: 'Камера-006',
      address: 'ул. Куйбышева, 95',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <StatsCards stats={stats} />

        <Tabs defaultValue="online-face" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="online-face">
              <Icon name="UserSearch" size={16} className="mr-2" />
              Онлайн поиск лиц
            </TabsTrigger>
            <TabsTrigger value="online-plate">
              <Icon name="Search" size={16} className="mr-2" />
              Онлайн поиск ГРЗ
            </TabsTrigger>
            <TabsTrigger value="history-face">Исторический поиск лиц</TabsTrigger>
            <TabsTrigger value="history-plate">Исторический поиск ГРЗ</TabsTrigger>
          </TabsList>

          <TabsContent value="online-face">
            <OnlineFaceTab
              isCreateFormOpen={isCreateFormOpen}
              setIsCreateFormOpen={setIsCreateFormOpen}
              faceEmails={faceEmails}
              setFaceEmails={setFaceEmails}
              faceMaxNicknames={faceMaxNicknames}
              setFaceMaxNicknames={setFaceMaxNicknames}
              selectedImages={selectedImages}
              isDragging={isDragging}
              onImageUpload={handleImageUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              removeImage={removeImage}
              clearImages={() => setSelectedImages([])}
              mockResults={mockResults}
            />
          </TabsContent>

          <TabsContent value="online-plate">
            <OnlinePlateTab
              isCreatePlateFormOpen={isCreatePlateFormOpen}
              setIsCreatePlateFormOpen={setIsCreatePlateFormOpen}
              plateSearch={plateSearch}
              setPlateSearch={setPlateSearch}
              plateEmails={plateEmails}
              setPlateEmails={setPlateEmails}
              handlePlateSearch={handlePlateSearch}
              mockResults={mockResults}
            />
          </TabsContent>

          <TabsContent value="history-face">
            <HistoryFaceTab
              cameras={cameras}
              selectedCameraIds={selectedCameraIds}
              onToggleCamera={toggleCamera}
              onSelectAllCameras={() => setSelectedCameraIds(cameras.map(c => c.id))}
              onResetCameras={() => setSelectedCameraIds([])}
              selectedImages={selectedImages}
              isDragging={isDragging}
              onImageUpload={handleImageUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              removeImage={removeImage}
              clearImages={() => setSelectedImages([])}
              mockResults={mockResults}
            />
          </TabsContent>

          <TabsContent value="history-plate">
            <HistoryPlateTab
              cameras={cameras}
              selectedPlateCameraIds={selectedPlateCameraIds}
              onTogglePlateCamera={togglePlateCamera}
              onSelectAllPlateCameras={() => setSelectedPlateCameraIds(cameras.map(c => c.id))}
              onResetPlateCameras={() => setSelectedPlateCameraIds([])}
              plateSearch={plateSearch}
              setPlateSearch={setPlateSearch}
              handlePlateSearch={handlePlateSearch}
              mockResults={mockResults}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ORD;