import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  stats: {
    faces24h: number;
    people24h: number;
    vehicles24h: number;
    plates24h: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Обнаружено лиц (24ч)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{stats.faces24h.toLocaleString('ru-RU')}</div>
            <Icon name="User" className="text-secondary" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Обнаружено людей (24ч)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{stats.people24h.toLocaleString('ru-RU')}</div>
            <Icon name="Users" className="text-secondary" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Обнаружено транспортных средств (24ч)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{stats.vehicles24h.toLocaleString('ru-RU')}</div>
            <Icon name="CarFront" className="text-primary" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Обнаружено ГРЗ (24ч)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">{stats.plates24h.toLocaleString('ru-RU')}</div>
            <Icon name="Hash" className="text-primary" size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
