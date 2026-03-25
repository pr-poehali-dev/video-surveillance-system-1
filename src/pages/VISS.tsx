import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { VISSApiTab } from '@/components/viss/VISSApiTab';
import { VISSMonitoringTab } from '@/components/viss/VISSMonitoringTab';
import { VISSDetectionsTab } from '@/components/viss/VISSDetectionsTab';
import { VISSCamerasWebTab } from '@/components/viss/VISSCamerasWebTab';

const VISS = () => {
  return (
    <div className="bg-background">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Модуль внешних и внутренних сервисов
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api">
            <Icon name="Code2" size={16} className="mr-2" />
            API документация
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Icon name="Activity" size={16} className="mr-2" />
            Мониторинг
          </TabsTrigger>
          <TabsTrigger value="detections">
            <Icon name="Scan" size={16} className="mr-2" />
            Обнаружения
          </TabsTrigger>
          <TabsTrigger value="cameras-web">
            <Icon name="ExternalLink" size={16} className="mr-2" />
            Веб-интерфейсы камер
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <VISSApiTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <VISSMonitoringTab />
        </TabsContent>

        <TabsContent value="detections">
          <VISSDetectionsTab />
        </TabsContent>

        <TabsContent value="cameras-web">
          <VISSCamerasWebTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VISS;
