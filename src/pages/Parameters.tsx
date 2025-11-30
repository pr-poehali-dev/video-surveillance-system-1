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
        <TabsList className="grid w-full grid-cols-3">
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
      </Tabs>
    </div>
  );
};

export default Parameters;