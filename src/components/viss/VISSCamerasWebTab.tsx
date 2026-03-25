import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const cameraList = [
  { name: 'Камера-001', ip: '192.168.1.10', port: 80 },
  { name: 'Камера-002', ip: '192.168.1.11', port: 80 },
  { name: 'Камера-003', ip: '192.168.1.12', port: 8080 },
];

export const VISSCamerasWebTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="MonitorPlay" size={20} />
          Веб-интерфейсы камер
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cameraList.map((camera, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Video" size={20} className="text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{camera.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {camera.ip}:{camera.port}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`http://${camera.ip}:${camera.port}`, '_blank');
                      toast.success('Открываем веб-интерфейс камеры');
                    }}
                  >
                    <Icon name="ExternalLink" size={18} className="mr-2" />
                    Открыть
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
