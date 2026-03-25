import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const apiEndpoints = [
  { method: 'GET', path: '/api/v1/cameras', description: 'Получить список камер' },
  { method: 'GET', path: '/api/v1/cameras/{id}', description: 'Получить камеру по ID' },
  { method: 'POST', path: '/api/v1/search/faces', description: 'Поиск лиц' },
  { method: 'POST', path: '/api/v1/search/plates', description: 'Поиск ГРЗ' },
  { method: 'GET', path: '/api/v1/events', description: 'Получить события' },
  { method: 'GET', path: '/api/v1/archive/{camera_id}', description: 'Видеоархив камеры' },
];

export const VISSApiTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Описание API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Базовый URL</h4>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                https://api.esvs-perm.ru
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Аутентификация</h4>
              <p className="text-sm text-muted-foreground mb-2">
                API использует Bearer токены для авторизации
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                Authorization: Bearer YOUR_TOKEN
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Endpoints</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {apiEndpoints.map((endpoint, index) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-xs font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {endpoint.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileJson" size={20} />
            Swagger документация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="FileJson" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Swagger UI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Интерактивная документация API
              </p>
              <Button>
                <Icon name="ExternalLink" size={18} className="mr-2" />
                Открыть Swagger
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
