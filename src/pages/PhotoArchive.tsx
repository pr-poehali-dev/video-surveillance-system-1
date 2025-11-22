import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ScreenshotTask {
  id: number;
  name: string;
  cameras: string[];
  startDate: string;
  endDate: string;
  interval: number;
  status: 'active' | 'paused' | 'completed';
  totalScreenshots: number;
}

const PhotoArchive = () => {
  const [tasks, setTasks] = useState<ScreenshotTask[]>([
    {
      id: 1,
      name: 'Ночной мониторинг центра',
      cameras: ['Камера-001', 'Камера-002'],
      startDate: '2024-11-20T22:00',
      endDate: '2024-11-21T06:00',
      interval: 300,
      status: 'completed',
      totalScreenshots: 192,
    },
    {
      id: 2,
      name: 'Парковка - дневной контроль',
      cameras: ['Камера-004'],
      startDate: '2024-11-21T08:00',
      endDate: '2024-11-21T20:00',
      interval: 600,
      status: 'active',
      totalScreenshots: 48,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScreenshotTask | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: '',
    endDate: '',
    interval: '300',
    dailyHour: '14',
    selectedCameras: [] as string[],
  });

  const mockScreenshots = [
    { id: 1, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+1', timestamp: '2024-11-20 22:05', camera: 'Камера-001' },
    { id: 2, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+2', timestamp: '2024-11-20 22:10', camera: 'Камера-001' },
    { id: 3, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+3', timestamp: '2024-11-20 22:15', camera: 'Камера-002' },
    { id: 4, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+4', timestamp: '2024-11-20 22:20', camera: 'Камера-002' },
    { id: 5, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+5', timestamp: '2024-11-20 22:25', camera: 'Камера-001' },
    { id: 6, url: 'https://placehold.co/400x300/1e40af/white?text=Screenshot+6', timestamp: '2024-11-20 22:30', camera: 'Камера-002' },
  ];

  const cameras = [
    { id: '1', name: 'Камера-001' },
    { id: '2', name: 'Камера-002' },
    { id: '3', name: 'Камера-003' },
    { id: '4', name: 'Камера-004' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'paused':
        return 'Приостановлено';
      case 'completed':
        return 'Завершено';
      default:
        return 'Неизвестно';
    }
  };

  const handleCreateTask = () => {
    if (!newTask.name || !newTask.startDate || !newTask.endDate) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const task: ScreenshotTask = {
      id: tasks.length + 1,
      name: newTask.name,
      cameras: newTask.selectedCameras,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      interval: parseInt(newTask.interval),
      status: 'active',
      totalScreenshots: 0,
    };

    setTasks([...tasks, task]);
    setIsCreateDialogOpen(false);
    setNewTask({ name: '', startDate: '', endDate: '', interval: '300', dailyHour: '14', selectedCameras: [] });
    toast.success('Задание создано');
  };

  const handleToggleStatus = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'active' ? 'paused' : 'active' }
          : task
      )
    );
    toast.success('Статус задания изменен');
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success('Задание удалено');
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Фотоархив</h1>
            <p className="text-sm text-muted-foreground">
              Управление заданиями скриншотов с камер видеонаблюдения
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать задание
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новое задание скриншотов</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-name">Название задания *</Label>
                  <Input
                    id="task-name"
                    placeholder="Введите название"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Дата и время начала *</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Дата и время окончания *</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={newTask.endDate}
                      onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Интервал скриншотов</Label>
                  <Select value={newTask.interval} onValueChange={(value) => setNewTask({ ...newTask, interval: value })}>
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Каждую минуту (60 сек)</SelectItem>
                      <SelectItem value="300">Каждые 5 минут (300 сек)</SelectItem>
                      <SelectItem value="600">Каждые 10 минут (600 сек)</SelectItem>
                      <SelectItem value="1800">Каждые 30 минут (1800 сек)</SelectItem>
                      <SelectItem value="3600">Каждый час (3600 сек)</SelectItem>
                      <SelectItem value="daily">Каждый день в указанный час</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newTask.interval === 'daily' && (
                  <div className="space-y-2">
                    <Label htmlFor="daily-hour">Время выполнения скриншота</Label>
                    <Select value={newTask.dailyHour || '14'} onValueChange={(value) => setNewTask({ ...newTask, dailyHour: value })}>
                      <SelectTrigger id="daily-hour">
                        <SelectValue placeholder="Выберите час" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Выберите камеры</Label>
                  <ScrollArea className="h-40 border rounded-lg p-3">
                    <div className="space-y-2">
                      {cameras.map((camera) => (
                        <div key={camera.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`camera-${camera.id}`}
                            className="w-4 h-4"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTask({
                                  ...newTask,
                                  selectedCameras: [...newTask.selectedCameras, camera.name],
                                });
                              } else {
                                setNewTask({
                                  ...newTask,
                                  selectedCameras: newTask.selectedCameras.filter((c) => c !== camera.name),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`camera-${camera.id}`} className="cursor-pointer">
                            {camera.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={handleCreateTask} className="w-full">
                  Создать задание
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего заданий</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Icon name="ListChecks" className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === 'active').length}
                </p>
              </div>
              <Icon name="Play" className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Приостановлено</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter((t) => t.status === 'paused').length}
                </p>
              </div>
              <Icon name="Pause" className="text-yellow-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего скриншотов</p>
                <p className="text-2xl font-bold">
                  {tasks.reduce((sum, task) => sum + task.totalScreenshots, 0)}
                </p>
              </div>
              <Icon name="Image" className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Активные задания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 ${getStatusColor(task.status)} rounded-full mt-1`} />
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{task.name}</h3>
                          <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(task.id)}
                        >
                          <Icon name={task.status === 'active' ? 'Pause' : 'Play'} size={14} className="mr-1" />
                          {task.status === 'active' ? 'Пауза' : 'Запустить'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Начало</p>
                        <p className="text-sm font-medium">
                          {new Date(task.startDate).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Окончание</p>
                        <p className="text-sm font-medium">
                          {new Date(task.endDate).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Интервал</p>
                        <p className="text-sm font-medium">{task.interval} сек</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Скриншотов</p>
                        <p className="text-sm font-medium">{task.totalScreenshots}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Камеры ({task.cameras.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {task.cameras.map((camera, index) => (
                          <Badge key={index} variant="outline">
                            <Icon name="Video" size={12} className="mr-1" />
                            {camera}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsArchiveDialogOpen(true);
                        }}
                      >
                        <Icon name="FolderOpen" size={14} className="mr-1" />
                        Просмотреть архив
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="Download" size={14} className="mr-1" />
                        Скачать все ({task.totalScreenshots})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Image" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет заданий</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте первое задание для автоматических скриншотов
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Создать задание
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FolderOpen" size={20} />
              Архив скриншотов: {selectedTask?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Всего скриншотов: {selectedTask?.totalScreenshots}
                </div>
                <Button variant="outline" size="sm">
                  <Icon name="Download" size={14} className="mr-1" />
                  Скачать все
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockScreenshots.map((screenshot) => (
                  <Card key={screenshot.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative group">
                      <img 
                        src={screenshot.url} 
                        alt={`Screenshot ${screenshot.id}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Icon name="Eye" size={16} className="mr-1" />
                          Открыть
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Icon name="Download" size={16} className="mr-1" />
                          Скачать
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline">
                          <Icon name="Video" size={10} className="mr-1" />
                          {screenshot.camera}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Icon name="Clock" size={10} />
                          {screenshot.timestamp}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoArchive;