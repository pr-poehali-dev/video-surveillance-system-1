import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CAMERA_PREVIEW_IMAGES: Record<string, string> = {
  'camera-1': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop',
  'camera-2': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=640&h=360&fit=crop',
  'camera-3': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640&h=360&fit=crop',
  'camera-4': 'https://images.unsplash.com/photo-1485201543483-f06c8d2a8fb4?w=640&h=360&fit=crop',
  'camera-5': 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=640&h=360&fit=crop',
  'camera-6': 'https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=640&h=360&fit=crop',
  'camera-7': 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=640&h=360&fit=crop',
  'camera-8': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=640&h=360&fit=crop',
  'camera-9': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=640&h=360&fit=crop',
};

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
  setNewTask: (task: CreateTaskDialogProps['newTask']) => void;
  cameras: { id: string; name: string }[];
  handleCreateTask: () => void;
}

const CreateTaskDialog = ({ isOpen, setIsOpen, newTask, setNewTask, cameras, handleCreateTask }: CreateTaskDialogProps) => {
  const [previewCam, setPreviewCam] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
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
                  <div key={camera.id} className="flex items-center gap-2 group">
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
                    <Label htmlFor={`camera-${camera.id}`} className="cursor-pointer flex items-center gap-2 flex-1">
                      <Icon name="Video" size={14} />
                      {camera.name}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={() => setPreviewCam(camera)}
                      title="Предпросмотр"
                    >
                      <Icon name="Eye" size={12} />
                    </Button>
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

    <Dialog open={!!previewCam} onOpenChange={(v) => { if (!v) setPreviewCam(null); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Eye" size={16} />
            {previewCam?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg overflow-hidden bg-muted aspect-video relative">
          {previewCam && CAMERA_PREVIEW_IMAGES[previewCam.id] ? (
            <img
              src={CAMERA_PREVIEW_IMAGES[previewCam.id]}
              alt={previewCam.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Video" size={48} className="text-muted-foreground opacity-40" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateTaskDialog;