import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { StatsCards } from '@/components/ord/StatsCards';
import { ImageUploadZone } from '@/components/ord/ImageUploadZone';
import { SearchResults } from '@/components/ord/SearchResults';

const ORD = () => {
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    },
    {
      id: 2,
      type: 'plate' as const,
      match: 98.2,
      time: '2024-11-21 14:28:43',
      camera: 'Камера-003',
      address: 'ул. Сибирская, 27',
      plate: 'А123ВС159',
    },
    {
      id: 3,
      type: 'face' as const,
      match: 87.3,
      time: '2024-11-21 14:15:22',
      camera: 'Камера-006',
      address: 'ул. Куйбышева, 95',
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

          <TabsContent value="online-face" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="UserSearch" size={20} />
                  Создать лист мониторинга лиц
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="face-name">Наименование <span className="text-destructive">*</span></Label>
                  <Input id="face-name" placeholder="Введите название листа мониторинга" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="face-description">Описание</Label>
                  <Input id="face-description" placeholder="Описание листа мониторинга" />
                </div>

                <ImageUploadZone
                  selectedImages={selectedImages}
                  isDragging={isDragging}
                  onImageUpload={handleImageUpload}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  removeImage={removeImage}
                  clearImages={() => setSelectedImages([])}
                />

                <Button className="w-full">
                  <Icon name="Play" size={16} className="mr-2" />
                  Запустить поиск
                </Button>
              </CardContent>
            </Card>

            <SearchResults results={mockResults} />
          </TabsContent>

          <TabsContent value="online-plate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Создать лист мониторинга ГРЗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plate-name">Наименование <span className="text-destructive">*</span></Label>
                  <Input id="plate-name" placeholder="Введите название листа мониторинга" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plate-description">Описание</Label>
                  <Input id="plate-description" placeholder="Описание листа мониторинга" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plate-search">Государственный регистрационный знак <span className="text-destructive">*</span></Label>
                  <Input
                    id="plate-search"
                    placeholder="Например: А123ВС159"
                    value={plateSearch}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      const filtered = value.replace(/[^АВЕКМНОРСТУХ0-9]/g, '');
                      setPlateSearch(filtered);
                    }}
                    className="font-mono"
                    required
                  />
                </div>

                <Button onClick={handlePlateSearch} className="w-full">
                  <Icon name="Search" size={16} className="mr-2" />
                  Запустить поиск
                </Button>
              </CardContent>
            </Card>

            <SearchResults results={mockResults.filter((r) => r.type === 'plate')} />
          </TabsContent>

          <TabsContent value="history-face" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={20} />
                  Исторический поиск лиц
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">Период от</Label>
                    <Input id="date-from" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">Период до</Label>
                    <Input id="date-to" type="datetime-local" />
                  </div>
                </div>

                <ImageUploadZone
                  selectedImages={selectedImages}
                  isDragging={isDragging}
                  onImageUpload={handleImageUpload}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  removeImage={removeImage}
                  clearImages={() => setSelectedImages([])}
                />

                <Button className="w-full">
                  <Icon name="Play" size={16} className="mr-2" />
                  Запустить исторический поиск
                </Button>
              </CardContent>
            </Card>

            <SearchResults results={mockResults} />
          </TabsContent>

          <TabsContent value="history-plate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={20} />
                  Исторический поиск по ГРЗ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="history-plate-search">Государственный регистрационный знак</Label>
                  <Input
                    id="history-plate-search"
                    placeholder="Например: А123ВС159"
                    value={plateSearch}
                    onChange={(e) => setPlateSearch(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="history-date-from">Период от</Label>
                    <Input id="history-date-from" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="history-date-to">Период до</Label>
                    <Input id="history-date-to" type="datetime-local" />
                  </div>
                </div>

                <Button className="w-full" onClick={handlePlateSearch}>
                  <Icon name="Search" size={16} className="mr-2" />
                  Найти в истории
                </Button>
              </CardContent>
            </Card>

            <SearchResults results={mockResults.filter((r) => r.type === 'plate')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ORD;