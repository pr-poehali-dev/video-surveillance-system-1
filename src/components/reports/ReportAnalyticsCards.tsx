import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Stats {
  facesDetected: number;
  platesDetected: number;
  totalCameras: number;
  faceRecognition: number;
  plateRecognition: number;
}

interface ReportAnalyticsCardsProps {
  stats: Stats;
  selectedPeriod: string;
}

export const ReportAnalyticsCards = ({ stats, selectedPeriod }: ReportAnalyticsCardsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Пользователи системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Всего пользователей</span>
                  </div>
                  <span className="text-2xl font-bold">23</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Зарегистрировано в системе
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Онлайн</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">7</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(7 / 23) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((7 / 23) * 100).toFixed(1)}% активных пользователей
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Scan" size={20} />
              Возможности распознавания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={18} className="text-secondary" />
                    <span className="text-sm font-medium">Распознавание лиц</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.faceRecognition}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${(stats.faceRecognition / stats.totalCameras) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.faceRecognition / stats.totalCameras) * 100).toFixed(1)}% от общего числа камер
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="CarFront" size={18} className="text-primary" />
                    <span className="text-sm font-medium">Распознавание ГРЗ</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.plateRecognition}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(stats.plateRecognition / stats.totalCameras) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.plateRecognition / stats.totalCameras) * 100).toFixed(1)}% от общего числа камер
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Распознавание лиц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Icon name="User" size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обнаружено лиц</p>
                  <p className="text-2xl font-bold">{stats.facesDetected.toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round(stats.facesDetected / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CarFront" size={20} />
              Распознавание ГРЗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="Hash" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обнаружено ГРЗ</p>
                  <p className="text-2xl font-bold">{stats.platesDetected.toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Среднее в день</span>
                  <span className="font-semibold">
                    {Math.round(stats.platesDetected / parseInt(selectedPeriod)).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReportAnalyticsCards;
