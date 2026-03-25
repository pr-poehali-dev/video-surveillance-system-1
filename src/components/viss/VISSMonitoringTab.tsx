import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Integration = {
  id: number;
  name: string;
  url: string;
  description: string;
  status: 'active' | 'stopped';
  requests: number;
  errors: number;
  avgTime: number;
};

const emptyIntegration = (): Omit<Integration, 'id' | 'requests' | 'errors' | 'avgTime'> => ({
  name: '',
  url: '',
  description: '',
  status: 'active',
});

const stats = {
  totalRequests: 167511,
  successRate: 99.6,
  avgResponseTime: 98,
  trafficMbit: 4.8,
};

export const VISSMonitoringTab = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 1, name: 'API v1 (REST)', url: 'https://api.example.com/v1', description: 'REST API первой версии', status: 'active', requests: 45821, errors: 12, avgTime: 124 },
    { id: 2, name: 'API v2 (GraphQL)', url: 'https://api.example.com/graphql', description: 'GraphQL API второй версии', status: 'active', requests: 23456, errors: 3, avgTime: 89 },
    { id: 3, name: 'WebSocket Stream', url: 'wss://stream.example.com', description: 'Потоковая передача данных', status: 'active', requests: 98234, errors: 45, avgTime: 45 },
  ]);

  const [integrationDialog, setIntegrationDialog] = useState<{ open: boolean; editing: Integration | null }>({ open: false, editing: null });
  const [integrationForm, setIntegrationForm] = useState(emptyIntegration());

  const openAddDialog = () => {
    setIntegrationForm(emptyIntegration());
    setIntegrationDialog({ open: true, editing: null });
  };

  const openEditDialog = (integration: Integration) => {
    setIntegrationForm({ name: integration.name, url: integration.url, description: integration.description, status: integration.status });
    setIntegrationDialog({ open: true, editing: integration });
  };

  const saveIntegration = () => {
    if (!integrationForm.name.trim()) { toast.error('Введите название интеграции'); return; }
    if (integrationDialog.editing) {
      setIntegrations(prev => prev.map(i => i.id === integrationDialog.editing!.id ? { ...i, ...integrationForm } : i));
      toast.success('Интеграция обновлена');
    } else {
      const newId = Math.max(0, ...integrations.map(i => i.id)) + 1;
      setIntegrations(prev => [...prev, { id: newId, ...integrationForm, requests: 0, errors: 0, avgTime: 0 }]);
      toast.success('Интеграция добавлена');
    }
    setIntegrationDialog({ open: false, editing: null });
  };

  const toggleIntegrationStatus = (id: number) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'active' ? 'stopped' : 'active' } : i));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего запросов</p>
                <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString('ru-RU')}</p>
              </div>
              <Icon name="TrendingUp" className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Успешность</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
              </div>
              <Icon name="CheckCircle2" className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Время отклика</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
              </div>
              <Icon name="Gauge" className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Трафик</p>
                <p className="text-2xl font-bold">{stats.trafficMbit} Мбит/с</p>
              </div>
              <Icon name="Activity" className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="LineChart" size={20} />
              Дашборды интеграций
            </CardTitle>
            <Button size="sm" onClick={openAddDialog}>
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${integration.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        {integration.description && (
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        )}
                        <Badge
                          variant="secondary"
                          className={`text-xs mt-1 ${integration.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {integration.status === 'active' ? 'Выполняется' : 'Остановлен'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleIntegrationStatus(integration.id)}
                      >
                        <Icon name={integration.status === 'active' ? 'Square' : 'Play'} size={14} className="mr-1" />
                        {integration.status === 'active' ? 'Остановить' : 'Запустить'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(integration)}>
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setIntegrations(prev => prev.filter(i => i.id !== integration.id));
                          toast.success(`Интеграция "${integration.name}" удалена`);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                  {integration.url && (
                    <p className="text-xs font-mono text-muted-foreground mb-3 truncate">{integration.url}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Запросов</p>
                      <p className="font-bold">{integration.requests.toLocaleString('ru-RU')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Ошибок</p>
                      <p className="font-bold text-red-600">{integration.errors}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Среднее время</p>
                      <p className="font-bold">{integration.avgTime}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {integrations.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Интеграции не добавлены
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={integrationDialog.open} onOpenChange={(open) => setIntegrationDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{integrationDialog.editing ? 'Редактировать интеграцию' : 'Новая интеграция'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Название <span className="text-red-500">*</span></Label>
              <Input
                value={integrationForm.name}
                onChange={e => setIntegrationForm(f => ({ ...f, name: e.target.value }))}
                placeholder="API v1 (REST)"
              />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input
                value={integrationForm.url}
                onChange={e => setIntegrationForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div className="space-y-1">
              <Label>Описание</Label>
              <Input
                value={integrationForm.description}
                onChange={e => setIntegrationForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание интеграции"
              />
            </div>
            <div className="space-y-1">
              <Label>Статус</Label>
              <Select value={integrationForm.status} onValueChange={v => setIntegrationForm(f => ({ ...f, status: v as 'active' | 'stopped' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Выполняется</SelectItem>
                  <SelectItem value="stopped">Остановлен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialog({ open: false, editing: null })}>Отмена</Button>
            <Button onClick={saveIntegration}>{integrationDialog.editing ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Трафик (последние 24 часа)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 24 }).map((_, index) => {
              const value = 3 + Math.random() * 3;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                    style={{ height: `${value * 35}px` }}
                    title={`${index}:00 - ${value.toFixed(2)} Мбит/с`}
                  />
                  <span className="text-xs text-muted-foreground">{index}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
