import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const ORD = () => {
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      toast.success('Изображение загружено');
    }
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
      type: 'face',
      match: 94.5,
      time: '2024-11-21 14:32:15',
      camera: 'Камера-001',
      address: 'ул. Ленина, 50',
    },
    {
      id: 2,
      type: 'plate',
      match: 98.2,
      time: '2024-11-21 14:28:43',
      camera: 'Камера-003',
      address: 'ул. Сибирская, 27',
      plate: 'А123ВС159',
    },
    {
      id: 3,
      type: 'face',
      match: 87.3,
      time: '2024-11-21 14:15:22',
      camera: 'Камера-006',
      address: 'ул. Куйбышева, 95',
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Лица и люди (24ч)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.faces24h.toLocaleString('ru-RU')}</div>
                <Icon name="User" className="text-secondary" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Обнаружено людей (24ч)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.people24h.toLocaleString('ru-RU')}</div>
                <Icon name="Users" className="text-secondary" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Транспорт (24ч)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.vehicles24h.toLocaleString('ru-RU')}</div>
                <Icon name="CarFront" className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ГРЗ (24ч)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.plates24h.toLocaleString('ru-RU')}</div>
                <Icon name="Hash" className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

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
            <TabsTrigger value="history-face">
              <Icon name="History" size={16} className="mr-2" />
              История поиска лиц
            </TabsTrigger>
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
                  <Label htmlFor="face-name">Наименование</Label>
                  <Input id="face-name" placeholder="Введите название листа мониторинга" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="face-description">Описание</Label>
                  <Input id="face-description" placeholder="Краткое описание задачи" />
                </div>

                <div className="space-y-2">
                  <Label>Загрузить изображения</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="face-upload"
                    />
                    <label htmlFor="face-upload" className="cursor-pointer">
                      <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Нажмите для загрузки изображений лиц
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG до 10MB
                      </p>
                    </label>
                  </div>
                  {selectedImage && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Icon name="CheckCircle" className="text-green-600" size={20} />
                      <span className="text-sm">{selectedImage.name}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full">
                  <Icon name="Play" size={16} className="mr-2" />
                  Начать мониторинг
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="List" size={20} />
                  Активные листы мониторинга
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Нет активных листов мониторинга
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="online-plate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Создать лист мониторинга государственных регистрационных знаков</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plate-name">Наименование</Label>
                  <Input id="plate-name" placeholder="Введите название задачи" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plate-number">Номер ГРЗ</Label>
                  <Input
                    id="plate-number"
                    placeholder="А123ВС159"
                    value={plateSearch}
                    onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
                    className="font-mono text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Можно использовать * для поиска по части номера, например: А*ВС159
                  </p>
                </div>

                <Button className="w-full" onClick={handlePlateSearch}>
                  <Icon name="Search" size={16} className="mr-2" />
                  Начать поиск ГРЗ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={20} />
                  Активные поиски
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Нет активных поисков
                </p>
              </CardContent>
            </Card>
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
                <div className="space-y-2">
                  <Label>Загрузить изображение для поиска</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="history-face-upload"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="history-face-upload" className="cursor-pointer">
                      <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Загрузите изображение лица для поиска в архиве
                      </p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дата начала</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата окончания</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>

                <Button className="w-full">
                  <Icon name="Search" size={16} className="mr-2" />
                  Найти в архиве
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Результаты поиска</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockResults
                      .filter((r) => r.type === 'face')
                      .map((result) => (
                        <Card key={result.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                                <Icon name="User" size={32} className="text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant={result.match > 90 ? 'default' : 'secondary'}
                                    className="text-sm"
                                  >
                                    Совпадение {result.match}%
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {result.time}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{result.camera}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Icon name="MapPin" size={12} />
                                    {result.address}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Icon name="Play" size={14} className="mr-1" />
                                    Видео
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Icon name="Download" size={14} className="mr-1" />
                                    Скачать
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history-plate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Исторический поиск ГРЗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ГРЗ для поиска</Label>
                  <Input
                    placeholder="А123ВС159 или А*ВС159"
                    className="font-mono text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Дата начала</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата окончания</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>

                <Button className="w-full">
                  <Icon name="Search" size={16} className="mr-2" />
                  Найти в архиве
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Результаты поиска</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockResults
                      .filter((r) => r.type === 'plate')
                      .map((result) => (
                        <Card key={result.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Icon name="CarFront" size={24} className="text-muted-foreground mx-auto mb-1" />
                                  <div className="text-xs font-mono font-bold">
                                    {result.plate}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="default" className="text-sm">
                                    Совпадение {result.match}%
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {result.time}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{result.camera}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Icon name="MapPin" size={12} />
                                    {result.address}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Icon name="Play" size={14} className="mr-1" />
                                    Видео
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Icon name="Download" size={14} className="mr-1" />
                                    Скачать
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ORD;