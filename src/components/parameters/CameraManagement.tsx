import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CameraManagement = () => {
  const [testingStream, setTestingStream] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cameras = [
    {
      id: 1,
      name: 'Камера-001',
      rtspUrl: 'rtsp://admin:pass@192.168.1.10:554/stream',
      model: 'Hikvision DS-2CD2143G0-I',
      address: 'г. Пермь, ул. Ленина, 50',
      owner: 'МВД',
      status: 'active',
      archiveDepth: 30,
    },
    {
      id: 2,
      name: 'Камера-002',
      rtspUrl: 'rtsp://admin:pass@192.168.1.11:554/stream',
      model: 'Dahua IPC-HFW5231E-Z',
      address: 'г. Пермь, ул. Мира, 15',
      owner: 'Полиция',
      status: 'active',
      archiveDepth: 30,
    },
  ];

  const filteredCameras = cameras.filter(camera => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address.toLowerCase().includes(query) ||
      camera.owner.toLowerCase().includes(query)
    );
  });

  const handleTestStream = () => {
    setTestingStream(true);
    setTimeout(() => {
      setTestingStream(false);
      toast.success('Видеопоток доступен');
    }, 2000);
  };

  return (
    <Tabs defaultValue="registry" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="registry">Камеры</TabsTrigger>
        <TabsTrigger value="groups">Группы камер</TabsTrigger>
        <TabsTrigger value="tags">Теги</TabsTrigger>
        <TabsTrigger value="tag-groups">Группы тегов</TabsTrigger>
        <TabsTrigger value="models">Модели</TabsTrigger>
      </TabsList>

      <TabsContent value="registry">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Video" size={20} />
                Реестр камер видеонаблюдения
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative w-80">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по наименованию, улице, собственнику..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить камеру
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Новая камера видеонаблюдения</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[700px]">
                    <div className="space-y-4 py-4 pr-4">
                      <div className="space-y-2">
                        <Label>RTSP ссылка на видеопоток *</Label>
                        <Input
                          placeholder="rtsp://username:password@ip:port/stream"
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Логин RTSP</Label>
                          <Input placeholder="admin" />
                        </div>
                        <div className="space-y-2">
                          <Label>Пароль RTSP</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleTestStream}
                          disabled={testingStream}
                        >
                          {testingStream ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Проверка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Проверить видеопоток
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Марка и модель камеры</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите модель" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hikvision-ds2cd">Hikvision DS-2CD2143G0-I</SelectItem>
                            <SelectItem value="dahua-ipc">Dahua IPC-HDBW4631R-ZS</SelectItem>
                            <SelectItem value="axis-p3375">Axis P3375-V</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>IP адрес PTZ</Label>
                          <Input placeholder="192.168.1.10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Порт PTZ</Label>
                          <Input placeholder="8000" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Логин PTZ</Label>
                          <Input placeholder="admin" />
                        </div>
                        <div className="space-y-2">
                          <Label>Пароль PTZ</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Собственник камеры</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите собственника" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mvd">МВД</SelectItem>
                            <SelectItem value="admin">Администрация</SelectItem>
                            <SelectItem value="gibdd">ГИБДД</SelectItem>
                            <SelectItem value="mchs">МЧС</SelectItem>
                            <SelectItem value="private">Частное лицо</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Глубина хранения видеоархива (дней)</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 дней</SelectItem>
                            <SelectItem value="14">14 дней</SelectItem>
                            <SelectItem value="30">30 дней</SelectItem>
                            <SelectItem value="60">60 дней</SelectItem>
                            <SelectItem value="90">90 дней</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Адрес местоположения</Label>
                        <Input placeholder="Определится автоматически по координатам" />
                      </div>

                      <div className="space-y-2">
                        <Label>Карта местоположения</Label>
                        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Переместите маркер для указания местоположения
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Локальный IP адрес</Label>
                          <Input placeholder="192.168.1.10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Порт</Label>
                          <Input placeholder="554" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Территориальное деление</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите территорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Центральный район</SelectItem>
                            <SelectItem value="leninsky">Ленинский район</SelectItem>
                            <SelectItem value="dzer">Дзержинский район</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Описание</Label>
                        <Input placeholder="Краткое описание камеры" />
                      </div>

                      <div className="space-y-2">
                        <Label>Примечание</Label>
                        <Input placeholder="Дополнительная информация" />
                      </div>

                      <Button className="w-full" onClick={() => toast.success('Камера добавлена')}>
                        Сохранить камеру
                      </Button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredCameras.map((camera) => (
                  <Card key={camera.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Icon name="Video" size={24} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{camera.name}</h4>
                            <p className="text-sm text-muted-foreground">{camera.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Изменить
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Модель</p>
                          <p className="font-medium">{camera.model}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Статус</p>
                          <Badge variant="secondary">Активна</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Архив</p>
                          <p className="font-medium">{camera.archiveDepth} дней</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">RTSP</p>
                          <p className="font-medium font-mono text-xs truncate">
                            {camera.rtspUrl.split('@')[1]}
                          </p>
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

      <TabsContent value="groups">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Folder" size={20} />
              Группы камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="Folder" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Организуйте камеры в группы по назначению
              </p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать группу
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tags">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Tag" size={20} />
              Теги камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="Tag" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Добавляйте теги для быстрого поиска</p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать тег
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tag-groups">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Tags" size={20} />
              Группы тегов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="Tags" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Объединяйте теги в группы</p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать группу тегов
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="models">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings2" size={20} />
              Модели камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Hikvision DS-2CD2143G0-I', 'Dahua IPC-HDBW4631R-ZS', 'Axis P3375-V'].map((model, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Video" size={20} className="text-muted-foreground" />
                        <span className="font-medium">{model}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CameraManagement;