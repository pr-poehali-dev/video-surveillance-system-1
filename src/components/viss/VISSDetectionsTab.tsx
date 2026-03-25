import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const cameras = [
  { id: 'all', name: 'Все камеры' },
  { id: '1', name: 'Камера-001' },
  { id: '2', name: 'Камера-002' },
];

const detections = [
  { camera: 'Камера-001', faces: 1234, people: 2341, vehicles: 892, plates: 756 },
  { camera: 'Камера-002', faces: 987, people: 1823, vehicles: 654, plates: 589 },
];

export const VISSDetectionsTab = () => {
  const [selectedCamera, setSelectedCamera] = useState('all');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Image" size={20} />
            Обнаружения по камерам
          </CardTitle>
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={camera.id}>
                  {camera.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {detections.map((detection, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">{detection.camera}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Распознавание лиц</p>
                      <p className="text-lg font-bold">{detection.faces.toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon name="Hash" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Распознавание ГРЗ</p>
                      <p className="text-lg font-bold">{detection.plates.toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
