import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  MOCK_DETECTIONS, MOCK_ALERTS, ZONE_STATS, TYPE_STATS,
  DRONE_PHOTOS, threatColor, threatLabel, alertBg, alertIcon, alertIconColor,
} from './types';
import type { DroneDetection } from './types';

interface BPLAStatsPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeCount: number;
  totalDetections: number;
  highThreatCount: number;
  onPhotoClick: (data: { url: string; detection: DroneDetection }) => void;
}

const BPLAStatsPanel = ({
  activeTab,
  onTabChange,
  activeCount,
  totalDetections,
  highThreatCount,
  onPhotoClick,
}: BPLAStatsPanelProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="detections">
          <Icon name="List" size={14} className="mr-1.5" />
          Обнаружения
        </TabsTrigger>
        <TabsTrigger value="stats">
          <Icon name="BarChart3" size={14} className="mr-1.5" />
          Статистика
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <Icon name="Bell" size={14} className="mr-1.5" />
          Журнал тревог
          {activeCount > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detections">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Дата / Время</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Зона</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Угроза</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Фото</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DETECTIONS.map((d) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-mono">{d.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <div>{d.date}</div>
                        <div className="text-muted-foreground">{d.time}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.zone}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={threatColor(d.threat)}>
                          {threatLabel(d.threat)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onPhotoClick({ url: DRONE_PHOTOS[(d.id - 1) % DRONE_PHOTOS.length], detection: d })}
                          className="w-16 h-12 rounded overflow-hidden bg-muted block hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img
                            src={DRONE_PHOTOS[(d.id - 1) % DRONE_PHOTOS.length]}
                            alt="БПЛА"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="MapPin" size={16} className="text-primary" />
                По секторам
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ZONE_STATS.map((z) => (
                <div key={z.zone}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{z.zone}</span>
                    <span className="text-muted-foreground">{z.neutralized}/{z.count} нейтрализовано</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(z.count / totalDetections) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>{z.count} обнаружений</span>
                    <span>{Math.round((z.count / totalDetections) * 100)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Plane" size={16} className="text-primary" />
                По типам БПЛА
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TYPE_STATS.map((t) => (
                <div key={t.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{t.type}</span>
                    <span className="text-muted-foreground">{t.count} шт.</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.percent}% от общего</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                Сводка за день
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-red-500">{highThreatCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Высокая угроза</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-yellow-500">{MOCK_DETECTIONS.filter(d => d.threat === 'medium').length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Средняя угроза</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-green-500">{MOCK_DETECTIONS.filter(d => d.threat === 'low').length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Низкая угроза</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="alerts">
        <Card>
          <CardContent className="p-4 space-y-2">
            {MOCK_ALERTS.map((a) => (
              <div key={a.id} className={`p-3 rounded-lg ${alertBg(a.type)}`}>
                <div className="flex items-start gap-2">
                  <Icon name={alertIcon(a.type)} fallback="Info" size={16} className={`mt-0.5 shrink-0 ${alertIconColor(a.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">{a.date} {a.time}</span>
                      <span className="text-xs text-muted-foreground">{a.zone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default BPLAStatsPanel;
