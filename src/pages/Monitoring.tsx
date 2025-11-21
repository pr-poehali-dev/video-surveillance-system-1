import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  lat: number;
  lng: number;
}

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const cameras: Camera[] = [
    { id: 1, name: 'Камера-001', address: 'ул. Ленина, 50', status: 'active', lat: 58.010455, lng: 56.229443 },
    { id: 2, name: 'Камера-002', address: 'ул. Монастырская, 12', status: 'active', lat: 58.011455, lng: 56.230443 },
    { id: 3, name: 'Камера-003', address: 'ул. Сибирская, 27', status: 'problem', lat: 58.009455, lng: 56.228443 },
    { id: 4, name: 'Камера-004', address: 'Комсомольский пр., 68', status: 'active', lat: 58.012455, lng: 56.231443 },
    { id: 5, name: 'Камера-005', address: 'ул. Петропавловская, 35', status: 'inactive', lat: 58.010955, lng: 56.229943 },
    { id: 6, name: 'Камера-006', address: 'ул. Куйбышева, 95', status: 'active', lat: 58.013455, lng: 56.232443 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-gray-500';
      case 'problem': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'inactive': return 'Неактивна';
      case 'problem': return 'Проблема';
      default: return 'Неизвестно';
    }
  };

  const filteredCameras = cameras.filter(
    camera =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Мониторинг</h1>
              <p className="text-xs text-muted-foreground">Карта камер видеонаблюдения</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Icon name="Maximize" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="MapPin" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Поиск камеры или адреса..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredCameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCamera?.id === camera.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCamera(camera)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`} />
                        <h3 className="font-semibold text-sm">{camera.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(camera.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="MapPin" size={12} />
                      {camera.address}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <span>Активные</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span>Неактивные</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Проблемные</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Map" size={32} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Карта Пермского края</p>
              <p className="text-xs text-muted-foreground">
                Интеграция с картографическими сервисами
              </p>
            </div>
          </div>

          {selectedCamera && (
            <Card className="absolute bottom-4 right-4 w-96 shadow-2xl animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{selectedCamera.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      {selectedCamera.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCamera(null)}
                  >
                    <Icon name="X" size={18} />
                  </Button>
                </div>

                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Icon name="Play" size={48} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Видеопоток</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge variant="outline">{getStatusLabel(selectedCamera.status)}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Разрешение:</span>
                    <span className="font-medium">1920x1080</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">FPS:</span>
                    <span className="font-medium">25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Трафик:</span>
                    <span className="font-medium">4.2 Мбит/с</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Icon name="History" size={16} className="mr-2" />
                    Архив
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Monitoring;
