import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface StatsCardsProps {
  tasks: ScreenshotTask[];
}

const StatsCards = ({ tasks }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего заданий</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <Icon name="Clock" className="text-primary" size={24} />
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
  );
};

export default StatsCards;
