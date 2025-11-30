import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AccessManagement from '@/components/parameters/AccessManagement';
import CameraManagement from '@/components/parameters/CameraManagement';
import TerritorialDivisions from '@/components/parameters/TerritorialDivisions';

const Parameters = () => {
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
                  <div className="text-center py-12">
                    <Icon name="Inbox" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет удаленных ролей</p>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <div className="text-center py-12">
                    <Icon name="Inbox" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет удаленных пользователей</p>
                  </div>
                </TabsContent>

                <TabsContent value="cameras">
                  <div className="text-center py-12">
                    <Icon name="Inbox" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет удаленных камер</p>
                  </div>
                </TabsContent>

                <TabsContent value="groups">
                  <div className="text-center py-12">
                    <Icon name="Inbox" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет удаленных групп камер</p>
                  </div>
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