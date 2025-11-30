import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import AccessManagement from '@/components/parameters/AccessManagement';
import CameraManagement from '@/components/parameters/CameraManagement';
import TerritorialDivisions from '@/components/parameters/TerritorialDivisions';
import { useTrashStore } from '@/stores/trashStore';
import { toast } from 'sonner';

const Parameters = () => {
  const { items, restoreFromTrash, deleteForever, getItemsByType } = useTrashStore();

  const handleRestore = (id: number, type: string) => {
    const item = restoreFromTrash(id);
    if (item) {
      toast.success(`${getTypeName(type)} восстановлен`);
    }
  };

  const handleDeleteForever = (id: number, type: string) => {
    deleteForever(id);
    toast.success(`${getTypeName(type)} удален навсегда`);
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      role: 'Роль',
      user: 'Пользователь',
      camera: 'Камера',
      cameraGroup: 'Группа камер',
    };
    return names[type] || 'Элемент';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTrashItems = (type: 'role' | 'user' | 'camera' | 'cameraGroup') => {
    const typeItems = getItemsByType(type);

    if (typeItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="Inbox" size={64} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Нет удаленных элементов</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {typeItems.map((item) => (
            <Card key={item.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {item.data.name || item.data.fio || `ID: ${item.data.id}`}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeName(item.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Удалено: {formatDate(item.deletedAt)}
                    </p>
                    {item.data.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.data.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item.id, item.type)}
                    >
                      <Icon name="RotateCcw" size={14} className="mr-1" />
                      Восстановить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForever(item.id, item.type)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Настройки системы и управление доступом
        </p>
      </div>

      <Tabs defaultValue="access" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="access">
            <Icon name="Shield" size={16} className="mr-2" />
            Управление доступом
          </TabsTrigger>
          <TabsTrigger value="cameras">
            <Icon name="Video" size={16} className="mr-2" />
            Источники видеонаблюдения
          </TabsTrigger>
          <TabsTrigger value="territorial">
            <Icon name="MapPin" size={16} className="mr-2" />
            Территориальные деления
          </TabsTrigger>
          <TabsTrigger value="trash">
            <Icon name="Trash2" size={16} className="mr-2" />
            Корзина
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <AccessManagement />
        </TabsContent>

        <TabsContent value="cameras">
          <CameraManagement />
        </TabsContent>

        <TabsContent value="territorial">
          <TerritorialDivisions />
        </TabsContent>

        <TabsContent value="trash">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trash2" size={20} />
                Корзина удаленных элементов
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Здесь хранятся удаленные роли, пользователи, камеры и группы камер. Вы можете восстановить их или удалить навсегда.
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="roles" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="roles">Роли</TabsTrigger>
                  <TabsTrigger value="users">Пользователи</TabsTrigger>
                  <TabsTrigger value="cameras">Камеры</TabsTrigger>
                  <TabsTrigger value="groups">Группы камер</TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                  {renderTrashItems('role')}
                </TabsContent>

                <TabsContent value="users">
                  {renderTrashItems('user')}
                </TabsContent>

                <TabsContent value="cameras">
                  {renderTrashItems('camera')}
                </TabsContent>

                <TabsContent value="groups">
                  {renderTrashItems('cameraGroup')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Parameters;