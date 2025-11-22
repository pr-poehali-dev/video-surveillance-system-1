import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreateTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  newTask: {
    name: string;
    startDate: string;
    endDate: string;
    interval: string;
    dailyHour: string;
    selectedCameras: string[];
  };
  setNewTask: (task: any) => void;
  cameras: { id: string; name: string }[];
  handleCreateTask: () => void;
}

const CreateTaskDialog = ({ isOpen, setIsOpen, newTask, setNewTask, cameras, handleCreateTask }: CreateTaskDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Label>Выбор камер *</Label>
            <ScrollArea className="h-[200px] border rounded-lg p-3">
              <div className="space-y-2">
                {cameras.map((camera) => (
                  <div key={camera.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`camera-${camera.id}`}
                      className="w-4 h-4"
                      checked={newTask.selectedCameras.includes(camera.name)}
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
                    <Label htmlFor={`camera-${camera.id}`} className="cursor-pointer flex items-center gap-2">
                      <Icon name="Video" size={14} />
                      {camera.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {newTask.selectedCameras.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newTask.selectedCameras.map((camera, index) => (
                  <Badge key={index} variant="secondary">
                    {camera}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          selectedCameras: newTask.selectedCameras.filter((c) => c !== camera),
                        });
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button className="w-full" onClick={handleCreateTask}>
            Создать задание
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
