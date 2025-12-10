import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { permissions, loading } = usePermissions();

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
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm">DEBUG: Права доступа</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">{JSON.stringify({ loading, permissions }, null, 2)}</pre>
          </CardContent>
        </Card>
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
                <div className="text-4xl font-bold text-orange-500">{stats.problematic}</div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" className="text-orange-500" size={24} />
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
              <Icon name="BarChart3" size={20} />
              Активность камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[85, 92, 88, 95, 90, 87, 93, 89, 94, 91, 96, 95].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Dashboard;