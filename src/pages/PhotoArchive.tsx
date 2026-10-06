import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import CreateTaskDialog from '@/components/photo-archive/CreateTaskDialog';
import StatsCards from '@/components/photo-archive/StatsCards';
import TasksList from '@/components/photo-archive/TasksList';
import ArchiveDialog from '@/components/photo-archive/ArchiveDialog';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';

const PHOTO_API = `${CAMERAS_SERVICE_API}?resource=photo-archive`;

interface Screenshot {
  id: number;
  url: string;
  timestamp: string;
  camera: string;
}

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
  const [tasks, setTasks] = useState<ScreenshotTask[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [cameras, setCameras] = useState<{ id: string; name: string }[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      const r = await fetch(PHOTO_API);
      const d = await r.json();
      setTasks(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Не удалось загрузить задания');
    }
  }, []);

  useEffect(() => {
    loadTasks();
    fetch(`${CAMERAS_SERVICE_API}?resource=registry`)
      .then((r) => r.json())
      .then((d) =>
        setCameras(Array.isArray(d) ? d.map((c: { id: number; name: string }) => ({ id: String(c.id), name: c.name })) : [])
      )
      .catch(() => setCameras([]));
  }, [loadTasks]);

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

  useEffect(() => {
    if (!isArchiveDialogOpen || !selectedTask) return;
    fetch(`${PHOTO_API}&task_id=${selectedTask.id}`)
      .then((r) => r.json())
      .then((d) => setScreenshots(Array.isArray(d) ? d : []))
      .catch(() => setScreenshots([]));
  }, [isArchiveDialogOpen, selectedTask]);

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

  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.startDate || !newTask.endDate) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const res = await fetch(PHOTO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newTask.name,
        cameras: newTask.selectedCameras,
        start_date: newTask.startDate,
        end_date: newTask.endDate,
        interval: parseInt(newTask.interval),
        daily_hour: parseInt(newTask.dailyHour),
      }),
    });
    if (!res.ok) {
      toast.error('Не удалось создать задание');
      return;
    }

    setIsCreateDialogOpen(false);
    setNewTask({ name: '', startDate: '', endDate: '', interval: '300', dailyHour: '14', selectedCameras: [] });
    toast.success('Задание создано');
    loadTasks();
  };

  const handleToggleStatus = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const status = task.status === 'active' ? 'paused' : 'active';
    const res = await fetch(PHOTO_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status }),
    });
    if (!res.ok) {
      toast.error('Не удалось изменить статус');
      return;
    }
    toast.success('Статус задания изменен');
    loadTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(PHOTO_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId }),
    });
    if (!res.ok) {
      toast.error('Не удалось удалить задание');
      return;
    }
    toast.success('Задание удалено');
    loadTasks();
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Управление заданиями скриншотов с камер видеонаблюдения
            </p>
          </div>
          <CreateTaskDialog
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            newTask={newTask}
            setNewTask={setNewTask}
            cameras={cameras}
            handleCreateTask={handleCreateTask}
          />
        </div>
      </div>

      <StatsCards tasks={tasks} />

      <TasksList
        tasks={tasks}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        handleToggleStatus={handleToggleStatus}
        handleDeleteTask={handleDeleteTask}
        setSelectedTask={setSelectedTask}
        setIsArchiveDialogOpen={setIsArchiveDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
      />

      <ArchiveDialog
        isOpen={isArchiveDialogOpen}
        setIsOpen={setIsArchiveDialogOpen}
        selectedTask={selectedTask}
        screenshots={screenshots}
      />
    </div>
  );
};

export default PhotoArchive;