import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';

interface OwnerNode {
  id: number;
  name: string;
  parent_id: number | null;
  total: number;
  active: number;
  inactive: number;
  problem: number;
}

interface OrgStat {
  id: number;
  name: string;
  total: number;
  active: number;
  inactive: number;
  problem: number;
}

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  problem: number;
  new_24h: number;
  new_7d: number;
  new_30d: number;
  owners_tree: OwnerNode[];
}

const buildOrgStats = (tree: OwnerNode[], rootNamePrefix: string): OrgStat[] => {
  const root = tree.find((o) => o.parent_id === null && o.name.startsWith(rootNamePrefix));
  if (!root) return [];

  const collect = (id: number): OwnerNode[] => {
    const self = tree.find((o) => o.id === id);
    const children = tree.filter((o) => o.parent_id === id).flatMap((c) => collect(c.id));
    return self ? [self, ...children] : children;
  };

  return tree
    .filter((o) => o.parent_id === root.id)
    .map((org) => {
      const nodes = collect(org.id);
      const sum = (key: 'total' | 'active' | 'inactive' | 'problem') =>
        nodes.reduce((acc, n) => acc + Number(n[key]), 0);
      return {
        id: org.id,
        name: org.name,
        total: sum('total'),
        active: sum('active'),
        inactive: sum('inactive'),
        problem: sum('problem'),
      };
    });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${CAMERAS_SERVICE_API}?resource=stats`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const stats = {
    totalCameras: data?.total ?? 0,
    active: data?.active ?? 0,
    inactive: data?.inactive ?? 0,
    problematic: data?.problem ?? 0,
    new24h: data?.new_24h ?? 0,
    new7d: data?.new_7d ?? 0,
    new30d: data?.new_30d ?? 0,
  };

  const MINISTRY_STATS = buildOrgStats(data?.owners_tree ?? [], 'Органы государственной власти');
  const OMSU_STATS = buildOrgStats(data?.owners_tree ?? [], 'Органы местного самоуправления');

  return (
    <div className="bg-background">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Обзор системы видеонаблюдения Пермского края
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card
            className="border-border/50 hover:shadow-lg transition-all cursor-pointer hover:border-primary/40 hover:scale-[1.02]"
            onClick={() => navigate('/monitoring')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Всего камер
                <Icon name="ArrowRight" size={14} className="text-muted-foreground/50" />
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

          <Card
            className="border-border/50 hover:shadow-lg transition-all cursor-pointer hover:border-green-500/40 hover:scale-[1.02]"
            onClick={() => navigate('/monitoring?status=active')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Активные
                <Icon name="ArrowRight" size={14} className="text-muted-foreground/50" />
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

          <Card
            className="border-border/50 hover:shadow-lg transition-all cursor-pointer hover:border-gray-400/40 hover:scale-[1.02]"
            onClick={() => navigate('/monitoring?status=inactive')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Неактивные
                <Icon name="ArrowRight" size={14} className="text-muted-foreground/50" />
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

          <Card
            className="border-border/50 hover:shadow-lg transition-all cursor-pointer hover:border-yellow-500/40 hover:scale-[1.02]"
            onClick={() => navigate('/monitoring?status=problem')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Проблемные
                <Icon name="ArrowRight" size={14} className="text-muted-foreground/50" />
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
              Органы государственной власти
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

      <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Landmark" size={20} />
              Органы местного самоуправления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {OMSU_STATS.map((omsu) => (
                <div key={omsu.id} className="border border-border rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-sm leading-tight">{omsu.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Всего</p>
                      <p className="text-lg font-bold">{omsu.total}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-600">Активных</p>
                      <p className="text-lg font-bold text-green-600">{omsu.active}</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-500">Неактивных</p>
                      <p className="text-lg font-bold text-red-500">{omsu.inactive}</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-yellow-600">Проблемных</p>
                      <p className="text-lg font-bold text-yellow-600">{omsu.problem}</p>
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