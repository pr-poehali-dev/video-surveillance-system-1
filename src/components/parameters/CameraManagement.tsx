import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { CameraList } from './CameraList';
import { AddCameraDialog } from './AddCameraDialog';
import { OwnerGroupsTree } from './OwnerGroupsTree';

const CameraManagement = () => {
  const [testingStream, setTestingStream] = useState(false);

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

  const handleTestStream = () => {
    setTestingStream(true);
    setTimeout(() => {
      setTestingStream(false);
      toast.success('Видеопоток успешно проверен');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <Tabs defaultValue="cameras" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cameras">
            <Icon name="Camera" size={16} className="mr-2" />
            Камеры
          </TabsTrigger>
          <TabsTrigger value="camera-groups">
            <Icon name="Layers" size={16} className="mr-2" />
            Группа камер
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Icon name="Folder" size={16} className="mr-2" />
            Реестр собственников
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Icon name="Tag" size={16} className="mr-2" />
            Теги
          </TabsTrigger>
          <TabsTrigger value="tag-groups">
            <Icon name="Tags" size={16} className="mr-2" />
            Группы тегов
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cameras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="Camera" size={20} />
                  Список камер
                </span>
                <AddCameraDialog onTestStream={handleTestStream} testingStream={testingStream} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraList cameras={cameras} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera-groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="Layers" size={20} />
                  Группы камер
                </span>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать группу
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icon name="Layers" size={64} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Группируйте камеры для удобного управления</p>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать первую группу
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <OwnerGroupsTree />
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
                <p className="text-muted-foreground mb-4">
                  Организуйте теги в группы
                </p>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать группу тегов
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraManagement;