import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface TasksListProps {
  tasks: ScreenshotTask[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  handleToggleStatus: (taskId: number) => void;
  handleDeleteTask: (taskId: number) => void;
  setSelectedTask: (task: ScreenshotTask) => void;
  setIsArchiveDialogOpen: (value: boolean) => void;
  setIsCreateDialogOpen: (value: boolean) => void;
}

const TasksList = ({
  tasks,
  getStatusColor,
  getStatusLabel,
  handleToggleStatus,
  handleDeleteTask,
  setSelectedTask,
  setIsArchiveDialogOpen,
  setIsCreateDialogOpen,
}: TasksListProps) => {
  return (
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
  );
};

export default TasksList;
