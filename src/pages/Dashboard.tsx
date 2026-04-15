import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const MINISTRY_STATS = [
  { id: 1, name: 'МВД', total: 420, active: 398, inactive: 14, problem: 8 },
  { id: 2, name: 'Министерство транспорта', total: 310, active: 295, inactive: 10, problem: 5 },
  { id: 3, name: 'Министерство внутренних дел регионов', total: 280, active: 261, inactive: 12, problem: 7 },
  { id: 4, name: 'ФСБ', total: 145, active: 140, inactive: 4, problem: 1 },
  { id: 5, name: 'Министерство обороны', total: 92, active: 95, inactive: 2, problem: 0 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    totalCameras: 1247,
    active: 1189,
    inactive: 42,
    problematic: 16,
    new24h: 8,
    new7d: 23,
    new30d: 67,
    faceRecognition: 856,
    plateRecognition: 723,
  };

  return (
    <div className="bg-background">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Обзор системы видеонаблюдения Пермского края
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего камер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{stats.totalCameras}</div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Video" className="text-primary" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600">{stats.active}</div>
                <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Неактивные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-gray-500">{stats.inactive}</div>
                <div className="w-12 h-12 bg-gray-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="XCircle" className="text-gray-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Проблемные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-yellow-500">{stats.problematic}</div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" className="text-yellow-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      <Card className="border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Новые подключения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">За последние 24 часа</p>
                <p className="text-2xl font-bold">{stats.new24h}</p>
              </div>
              <Badge variant="secondary" className="text-lg">+{stats.new24h}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">За последние 7 дней</p>
                <p className="text-2xl font-bold">{stats.new7d}</p>
              </div>
              <Badge variant="secondary" className="text-lg">+{stats.new7d}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">За последние 30 дней</p>
                <p className="text-2xl font-bold">{stats.new30d}</p>
              </div>
              <Badge variant="secondary" className="text-lg">+{stats.new30d}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={20} />
              Дашборд по министерствам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {MINISTRY_STATS.map((ministry) => (
                <div key={ministry.id} className="border border-border rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-sm leading-tight">{ministry.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Всего</p>
                      <p className="text-lg font-bold">{ministry.total}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-600">Активных</p>
                      <p className="text-lg font-bold text-green-600">{ministry.active}</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-500">Неактивных</p>
                      <p className="text-lg font-bold text-red-500">{ministry.inactive}</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-yellow-600">Проблемных</p>
                      <p className="text-lg font-bold text-yellow-600">{ministry.problem}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Dashboard;