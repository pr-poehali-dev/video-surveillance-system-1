import { useState } from 'react';
import { toast } from 'sonner';
import CreateTaskDialog from '@/components/photo-archive/CreateTaskDialog';
import StatsCards from '@/components/photo-archive/StatsCards';
import TasksList from '@/components/photo-archive/TasksList';
import ArchiveDialog from '@/components/photo-archive/ArchiveDialog';

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
        mockScreenshots={mockScreenshots}
      />
    </div>
  );
};

export default PhotoArchive;