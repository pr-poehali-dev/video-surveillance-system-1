import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { CameraList } from './CameraList';
import { AddCameraDialog } from './AddCameraDialog';
import { OwnerGroupsTree } from './OwnerGroupsTree';
import CameraGroupsTab from './camera-groups/CameraGroupsTab';
import { CameraModelsTab } from './CameraModelsTab';

const CameraManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

  const handleCameraAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupDialog(true);
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
          <TabsTrigger value="models">
            <Icon name="Box" size={16} className="mr-2" />
            Модели камер
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
                <AddCameraDialog onSuccess={handleCameraAdded} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraList refreshTrigger={refreshTrigger} />
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
                <Button onClick={handleCreateGroup}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать группу
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraGroupsTab onCreateClick={handleCreateGroup} />
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

        <TabsContent value="models">
          <CameraModelsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraManagement;