import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { StatsCards } from '@/components/ord/StatsCards';
import { OnlineFaceTab } from '@/components/ord/OnlineFaceTab';
import { OnlinePlateTab } from '@/components/ord/OnlinePlateTab';
import { HistoryFaceTab } from '@/components/ord/HistoryFaceTab';
import { HistoryPlateTab } from '@/components/ord/HistoryPlateTab';
import { CameraOption } from '@/components/ord/CameraMultiSelect';
import { Button } from '@/components/ui/button';
import AddRecognitionDialog from '@/components/ord/AddRecognitionDialog';
import { Recognition, fetchRecognitions, fetchOrdStats, deleteRecognition } from '@/components/ord/ordApi';
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
  const [plateMaxNicknames, setPlateMaxNicknames] = useState<string[]>(['']);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<number[]>([]);
  const [selectedPlateCameraIds, setSelectedPlateCameraIds] = useState<number[]>([]);

  const [onlineFaces, setOnlineFaces] = useState<Recognition[]>([]);
  const [onlinePlates, setOnlinePlates] = useState<Recognition[]>([]);
  const [stats, setStats] = useState({ faces24h: 0, people24h: 0, vehicles24h: 0, plates24h: 0 });
  const [addOpen, setAddOpen] = useState(false);

  const [faceHistory, setFaceHistory] = useState<Recognition[]>([]);
  const [faceSearched, setFaceSearched] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [plateHistory, setPlateHistory] = useState<Recognition[]>([]);
  const [plateSearched, setPlateSearched] = useState(false);
  const [plateLoading, setPlateLoading] = useState(false);

  const loadOnline = useCallback(async () => {
    try {
      const [faces, plates, st] = await Promise.all([
        fetchRecognitions({ kind: 'face', limit: '50' }),
        fetchRecognitions({ kind: 'plate', limit: '50' }),
        fetchOrdStats(),
      ]);
      setOnlineFaces(faces);
      setOnlinePlates(plates);
      setStats({ faces24h: st.faces24h, people24h: 0, vehicles24h: 0, plates24h: st.plates24h });
    } catch {
      toast.error('Не удалось загрузить данные ОРД');
    }
  }, []);

  useEffect(() => {
    loadOnline();
  }, [loadOnline]);

  const handleDeleteRecognition = async (id: number) => {
    const ok = await deleteRecognition(id);
    if (ok) loadOnline();
    return ok;
  };

  const toIso = (v: string) => (v ? v.replace('T', ' ') : undefined);

  const searchFaceHistory = async ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) => {
    setFaceLoading(true);
    try {
      const list = await fetchRecognitions({
        kind: 'face',
        date_from: toIso(dateFrom),
        date_to: toIso(dateTo),
        camera_ids: selectedCameraIds.join(','),
        limit: '500',
      });
      setFaceHistory(list);
      setFaceSearched(true);
    } catch {
      toast.error('Не удалось выполнить поиск');
    } finally {
      setFaceLoading(false);
    }
  };

  const searchPlateHistory = async ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) => {
    if (!plateSearch) {
      toast.error('Введите номер ГРЗ');
      return;
    }
    setPlateLoading(true);
    try {
      const list = await fetchRecognitions({
        kind: 'plate',
        plate: plateSearch,
        date_from: toIso(dateFrom),
        date_to: toIso(dateTo),
        camera_ids: selectedPlateCameraIds.join(','),
        limit: '500',
      });
      setPlateHistory(list);
      setPlateSearched(true);
    } catch {
      toast.error('Не удалось выполнить поиск');
    } finally {
      setPlateLoading(false);
    }
  };

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

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Распознавания лиц и номеров из базы данных</p>
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить распознавание
          </Button>
        </div>

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
              results={onlineFaces}
              onDeleteResult={handleDeleteRecognition}
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
              plateMaxNicknames={plateMaxNicknames}
              setPlateMaxNicknames={setPlateMaxNicknames}
              handlePlateSearch={handlePlateSearch}
              results={onlinePlates}
              onDeleteResult={handleDeleteRecognition}
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
              results={faceHistory}
              searched={faceSearched}
              loading={faceLoading}
              onSearch={searchFaceHistory}
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
              results={plateHistory}
              searched={plateSearched}
              loading={plateLoading}
              onSearch={searchPlateHistory}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddRecognitionDialog open={addOpen} onOpenChange={setAddOpen} cameras={cameras} onSaved={loadOnline} />
    </div>
  );
};

export default ORD;