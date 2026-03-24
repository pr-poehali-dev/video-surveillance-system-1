import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Stats {
  totalUptime: number;
  avgUptime: number;
}

interface ReportStatsCardsProps {
  stats: Stats;
  selectedPeriod: string;
}

export const ReportStatsCards = ({ stats, selectedPeriod }: ReportStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Работоспособность портала
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">{stats.totalUptime}%</span>
              <Icon name="TrendingUp" className="text-green-600" size={24} />
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats.totalUptime}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">За последние {selectedPeriod} дней</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Работоспособность видеоаналитики распознавания лиц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{stats.avgUptime}%</span>
              <Icon name="Video" className="text-blue-600" size={24} />
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.avgUptime}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Среднее время работы</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Работоспособность видеоаналитики распознавания ГРЗ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-orange-600">26.4ч</span>
              <Icon name="AlertTriangle" className="text-orange-600" size={24} />
            </div>
            <p className="text-xs text-muted-foreground">Из {parseInt(selectedPeriod) * 24} часов</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportStatsCards;
