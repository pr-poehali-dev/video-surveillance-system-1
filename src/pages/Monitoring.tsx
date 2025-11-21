import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  owner: string;
  group: string;
  lat: number;
  lng: number;
  resolution: string;
  fps: number;
  traffic: number;
}

const Monitoring = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const cameras: Camera[] = [
    { id: 1, name: 'Камера-001', address: 'г. Пермь, ул. Ленина, 50', status: 'active', owner: 'МВД', group: 'Центр города', lat: 58.010455, lng: 56.229443, resolution: '1920x1080', fps: 25, traffic: 4.2 },
    { id: 2, name: 'Камера-002', address: 'г. Пермь, ул. Монастырская, 12', status: 'active', owner: 'МВД', group: 'Центр города', lat: 58.011455, lng: 56.230443, resolution: '1920x1080', fps: 25, traffic: 3.8 },
    { id: 3, name: 'Камера-003', address: 'г. Пермь, ул. Сибирская, 27', status: 'problem', owner: 'МВД', group: 'Центр города', lat: 58.009455, lng: 56.228443, resolution: '1280x720', fps: 15, traffic: 2.1 },
    { id: 4, name: 'Камера-004', address: 'г. Пермь, Комсомольский пр., 68', status: 'active', owner: 'Администрация', group: 'Транспорт', lat: 58.012455, lng: 56.231443, resolution: '1920x1080', fps: 30, traffic: 5.1 },
    { id: 5, name: 'Камера-005', address: 'г. Пермь, ул. Петропавловская, 35', status: 'inactive', owner: 'МВД', group: 'Центр города', lat: 58.010955, lng: 56.229943, resolution: '1920x1080', fps: 0, traffic: 0 },
    { id: 6, name: 'Камера-006', address: 'г. Пермь, ул. Куйбышева, 95', status: 'active', owner: 'Администрация', group: 'Транспорт', lat: 58.013455, lng: 56.232443, resolution: '1920x1080', fps: 25, traffic: 4.5 },
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

  const handleMyLocation = () => {
    toast.info('Определение местоположения...');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast.success(isFullscreen ? 'Обычный режим' : 'Полноэкранный режим');
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
    const matchesOwner = ownerFilter === 'all' || camera.owner === ownerFilter;
    return matchesSearch && matchesStatus && matchesOwner;
  });

  const stats = {
    total: cameras.length,
    active: cameras.filter((c) => c.status === 'active').length,
    inactive: cameras.filter((c) => c.status === 'inactive').length,
    problem: cameras.filter((c) => c.status === 'problem').length,
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">\u041c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433</h1>
        <p className="text-sm text-muted-foreground">
          \u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u0430 \u043a\u0430\u043c\u0435\u0440 \u0432\u0438\u0434\u0435\u043e\u043d\u0430\u0431\u043b\u044e\u0434\u0435\u043d\u0438\u044f
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">\u0412\u0441\u0435\u0433\u043e</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Icon name="Video" className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <Icon name="XCircle" className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u044b\u0435</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.problem}</p>
              </div>
              <Icon name="AlertTriangle" className="text-yellow-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  \u041a\u0430\u0440\u0442\u0430 \u043a\u0430\u043c\u0435\u0440
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setClusteringEnabled(!clusteringEnabled)}
                    title={clusteringEnabled ? '\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044e' : '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044e'}
                  >
                    <Icon name={clusteringEnabled ? 'Layers' : 'Grid3x3'} size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMyLocation}
                    title="\u041c\u043e\u0435 \u043c\u0435\u0441\u0442\u043e\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435"
                  >
                    <Icon name="MapPin" size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFullscreen}
                    title="\u041f\u043e\u043b\u043d\u043e\u044d\u043a\u0440\u0430\u043d\u043d\u044b\u0439 \u0440\u0435\u0436\u0438\u043c"
                  >
                    <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="Map" size={48} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      \u041a\u0430\u0440\u0442\u0430 \u041f\u0435\u0440\u043c\u0441\u043a\u043e\u0433\u043e \u043a\u0440\u0430\u044f \u0441 \u043a\u0430\u043c\u0435\u0440\u0430\u043c\u0438
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      \u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044f \u0441 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043a\u0438\u043c \u0441\u0435\u0440\u0432\u0438\u0441\u043e\u043c
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="relative">
                    <Icon
                      name="Search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0430\u0434\u0440\u0435\u0441\u0443 \u0438\u043b\u0438 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e \u043a\u0430\u043c\u0435\u0440\u044b..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                {filteredCameras.map((camera) => (
                  <button
                    key={camera.id}
                    onClick={() => { setSelectedCamera(camera); setShowVideoDialog(true); }}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    style={{
                      left: `${20 + camera.id * 12}%`,
                      top: `${30 + camera.id * 8}%`,
                    }}
                  >
                    <div className={`w-8 h-8 ${getStatusColor(camera.status)} rounded-full flex items-center justify-center border-2 border-white`}>
                      <Icon name="Video" size={16} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="List" size={20} />
                \u0420\u0435\u0435\u0441\u0442\u0440 \u043a\u0430\u043c\u0435\u0440
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3 border-b">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="\u0424\u0438\u043b\u044c\u0442\u0440 \u043f\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0443" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044b</SelectItem>
                    <SelectItem value="active">\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435</SelectItem>
                    <SelectItem value="inactive">\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435</SelectItem>
                    <SelectItem value="problem">\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u044b\u0435</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="\u0424\u0438\u043b\u044c\u0442\u0440 \u043f\u043e \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a\u0443" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">\u0412\u0441\u0435 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a\u0438</SelectItem>
                    <SelectItem value="\u041c\u0412\u0414">\u041c\u0412\u0414</SelectItem>
                    <SelectItem value="\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f">\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-3">"}, {"old_string": "          <ScrollArea className=\"flex-1\">
            <div className=\"p-4 space-y-2\">
              {filteredCameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCamera?.id === camera.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCamera(camera)}
                >
                  <CardContent className=\"p-4\">
                    <div className=\"flex items-start justify-between mb-2\">
                      <div className=\"flex items-center gap-2\">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`} />
                        <h3 className=\"font-semibold text-sm\">{camera.name}</h3>
                      </div>
                      <Badge variant=\"outline\" className=\"text-xs\">
                        {getStatusLabel(camera.status)}
                      </Badge>
                    </div>
                    <p className=\"text-xs text-muted-foreground flex items-center gap-1\">
                      <Icon name=\"MapPin\" size={12} />
                      {camera.address}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className=\"p-4 border-t border-border\">
            <div className=\"grid grid-cols-3 gap-2 text-xs\">
              <div className=\"flex items-center gap-1\">
                <div className=\"w-2 h-2 rounded-full bg-green-600\" />
                <span>\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435</span>
              </div>
              <div className=\"flex items-center gap-1\">
                <div className=\"w-2 h-2 rounded-full bg-gray-500\" />
                <span>\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435</span>
              </div>
              <div className=\"flex items-center gap-1\">
                <div className=\"w-2 h-2 rounded-full bg-orange-500\" />
                <span>\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u044b\u0435</span>
              </div>
            </div>
          </div>
        </aside>

        <main className=\"flex-1 relative\">
          <div className=\"absolute inset-0 bg-muted/30 flex items-center justify-center\">
            <div className=\"text-center\">
              <div className=\"w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4\">
                <Icon name=\"Map\" size={32} className=\"text-primary\" />
              </div>
              <p className=\"text-sm text-muted-foreground mb-2\">\u041a\u0430\u0440\u0442\u0430 \u041f\u0435\u0440\u043c\u0441\u043a\u043e\u0433\u043e \u043a\u0440\u0430\u044f</p>
              <p className=\"text-xs text-muted-foreground\">
                \u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044f \u0441 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043a\u0438\u043c\u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u0430\u043c\u0438
              </p>
            </div>
          </div>

          {selectedCamera && (
            <Card className=\"absolute bottom-4 right-4 w-96 shadow-2xl animate-fade-in\">
              <CardContent className=\"p-4\">
                <div className=\"flex items-start justify-between mb-4\">
                  <div>
                    <h3 className=\"font-bold text-lg mb-1\">{selectedCamera.name}</h3>
                    <p className=\"text-sm text-muted-foreground flex items-center gap-1\">
                      <Icon name=\"MapPin\" size={14} />
                      {selectedCamera.address}
                    </p>
                  </div>
                  <Button
                    variant=\"ghost\"
                    size=\"icon\"
                    onClick={() => setSelectedCamera(null)}
                  >
                    <Icon name=\"X\" size={18} />
                  </Button>
                </div>

                <div className=\"aspect-video bg-muted rounded-lg flex items-center justify-center mb-4\">
                  <div className=\"text-center\">
                    <Icon name=\"Play\" size={48} className=\"text-muted-foreground mx-auto mb-2\" />
                    <p className=\"text-sm text-muted-foreground\">\u0412\u0438\u0434\u0435\u043e\u043f\u043e\u0442\u043e\u043a</p>
                  </div>
                </div>

                <div className=\"space-y-2 mb-4\">
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-muted-foreground\">\u0421\u0442\u0430\u0442\u0443\u0441:</span>
                    <Badge variant=\"outline\">{getStatusLabel(selectedCamera.status)}</Badge>
                  </div>
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-muted-foreground\">\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435:</span>
                    <span className=\"font-medium\">1920x1080</span>
                  </div>
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-muted-foreground\">FPS:</span>
                    <span className=\"font-medium\">25</span>
                  </div>
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-muted-foreground\">\u0422\u0440\u0430\u0444\u0438\u043a:</span>
                    <span className=\"font-medium\">4.2 \u041c\u0431\u0438\u0442/\u0441</span>
                  </div>
                </div>

                <div className=\"flex gap-2\">
                  <Button variant=\"outline\" className=\"flex-1\" size=\"sm\">
                    <Icon name=\"History\" size={16} className=\"mr-2\" />
                    \u0410\u0440\u0445\u0438\u0432
                  </Button>
                  <Button variant=\"outline\" className=\"flex-1\" size=\"sm\">
                    <Icon name=\"Settings\" size={16} className=\"mr-2\" />
                    \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>", "new_string": "                  {filteredCameras.map((camera) => (
                    <Card
                      key={camera.id}
                      className=\"cursor-pointer hover:shadow-md transition-shadow\"
                      onClick={() => { setSelectedCamera(camera); setShowVideoDialog(true); }}
                    >
                      <CardContent className=\"p-4\">
                        <div className=\"flex items-start justify-between mb-2\">
                          <div className=\"flex items-center gap-2\">
                            <div className={`w-3 h-3 ${getStatusColor(camera.status)} rounded-full`} />
                            <h4 className=\"font-medium\">{camera.name}</h4>
                          </div>
                          <Badge variant=\"secondary\" className=\"text-xs\">
                            {camera.owner}
                          </Badge>
                        </div>
                        <p className=\"text-sm text-muted-foreground mb-2\">
                          {camera.address}
                        </p>
                        <div className=\"flex items-center gap-2\">
                          <Badge variant=\"outline\" className=\"text-xs\">
                            {camera.group}
                          </Badge>
                          <Badge variant=\"outline\" className=\"text-xs\">
                            {getStatusLabel(camera.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredCameras.length === 0 && (
                    <div className=\"text-center py-8\">
                      <Icon name=\"Search\" size={48} className=\"text-muted-foreground mx-auto mb-2\" />
                      <p className=\"text-muted-foreground\">\u041a\u0430\u043c\u0435\u0440\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className=\"max-w-4xl\">
          <DialogHeader>
            <DialogTitle className=\"flex items-center gap-2\">
              <Icon name=\"Video\" size={20} />
              {selectedCamera?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedCamera && (
            <div className=\"space-y-4\">
              <div className=\"aspect-video bg-black rounded-lg flex items-center justify-center\">
                <div className=\"text-center\">
                  <Icon name=\"Play\" size={64} className=\"text-white mx-auto mb-2\" />
                  <p className=\"text-white\">\u0412\u0438\u0434\u0435\u043e\u043f\u043e\u0442\u043e\u043a</p>
                  <p className=\"text-white/60 text-sm\">{selectedCamera.resolution} \u2022 {selectedCamera.fps} FPS</p>
                </div>
              </div>

              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">\u0410\u0434\u0440\u0435\u0441</p>
                  <p className=\"font-medium\">{selectedCamera.address}</p>
                </div>
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">\u0421\u0442\u0430\u0442\u0443\u0441</p>
                  <div className=\"flex items-center gap-2\">
                    <div className={`w-3 h-3 ${getStatusColor(selectedCamera.status)} rounded-full`} />
                    <span className=\"font-medium\">{getStatusLabel(selectedCamera.status)}</span>
                  </div>
                </div>
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435</p>
                  <p className=\"font-medium\">{selectedCamera.resolution}</p>
                </div>
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">FPS</p>
                  <p className=\"font-medium\">{selectedCamera.fps}</p>
                </div>
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">\u0422\u0440\u0430\u0444\u0438\u043a</p>
                  <p className=\"font-medium\">{selectedCamera.traffic} \u041c\u0431\u0438\u0442/\u0441</p>
                </div>
                <div>
                  <p className=\"text-sm text-muted-foreground mb-1\">\u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a</p>
                  <p className=\"font-medium\">{selectedCamera.owner}</p>
                </div>
              </div>

              <div className=\"flex items-center gap-2\">
                <Button className=\"flex-1\">
                  <Icon name=\"Archive\" size={18} className=\"mr-2\" />
                  \u0412\u0438\u0434\u0435\u043e\u0430\u0440\u0445\u0438\u0432
                </Button>
                <Button variant=\"outline\" className=\"flex-1\">
                  <Icon name=\"Download\" size={18} className=\"mr-2\" />
                  \u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>"}, {"old_string": "  const getStatusColor = (status: string) => {\n    switch (status) {\n      case 'active': return 'bg-green-600';\n      case 'inactive': return 'bg-gray-500';\n      case 'problem': return 'bg-orange-500';\n      default: return 'bg-gray-500';\n    }\n  };\n\n  const getStatusLabel = (status: string) => {\n    switch (status) {\n      case 'active': return '\u0410\u043a\u0442\u0438\u0432\u043d\u0430';\n      case 'inactive': return '\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u0430';\n      case 'problem': return '\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u0430';\n      default: return '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e';\n    }\n  };", "new_string": "  const getStatusColor = (status: string) => {\n    switch (status) {\n      case 'active':\n        return 'bg-green-500';\n      case 'inactive':\n        return 'bg-red-500';\n      case 'problem':\n        return 'bg-yellow-500';\n      default:\n        return 'bg-gray-500';\n    }\n  };\n\n  const getStatusLabel = (status: string) => {\n    switch (status) {\n      case 'active':\n        return '\u0410\u043a\u0442\u0438\u0432\u043d\u0430\u044f';\n      case 'inactive':\n        return '\u041d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u0430\u044f';\n      case 'problem':\n        return '\u041f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u0430\u044f';\n      default:\n        return '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e';\n    }\n  };"}]

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