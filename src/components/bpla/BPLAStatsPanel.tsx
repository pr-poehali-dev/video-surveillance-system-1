import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import Icon from '@/components/ui/icon';
import {
  computeZoneStats, computeTypeStats, buildAlerts,
  threatColor, threatLabel, statusColor, statusLabel, alertBg, alertIcon, alertIconColor,
} from './types';
import type { DroneDetection } from './types';
import BPLAVideoModal from './BPLAVideoModal';

interface BPLAStatsPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeCount: number;
  totalDetections: number;
  highThreatCount: number;
  detections: DroneDetection[];
  loading: boolean;
  onConfirm: (id: number, value: boolean) => void;
  onDelete: (id: number) => void;
  onPhotoClick: (data: { url: string; detection: DroneDetection }) => void;
}

const BPLAStatsPanel = ({
  activeTab,
  onTabChange,
  activeCount,
  detections,
  loading,
  onConfirm,
  onDelete,
  onPhotoClick,
}: BPLAStatsPanelProps) => {
  const [videoDetection, setVideoDetection] = useState<DroneDetection | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string[]>([]);

  const handleConfirm = (id: number, value: boolean) => onConfirm(id, value);

  const zoneOptions = useMemo(() => {
    const zones = [...new Set(detections.map(d => d.zone).filter(Boolean))];
    return zones.map(z => ({ value: z, label: z }));
  }, [detections]);

  const filteredDetections = useMemo(() => {
    if (zoneFilter.length === 0) return detections;
    return detections.filter(d => zoneFilter.includes(d.zone));
  }, [zoneFilter, detections]);

  const zoneStats = useMemo(() => computeZoneStats(detections), [detections]);
  const typeStats = useMemo(() => computeTypeStats(detections), [detections]);
  const alerts = useMemo(() => buildAlerts(detections), [detections]);

  return (
    <>
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
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Filter" size={14} className="text-muted-foreground shrink-0" />
            <MultiSelectCombobox
              options={zoneOptions}
              selected={zoneFilter}
              onChange={setZoneFilter}
              placeholder="Все секторы"
              searchPlaceholder="Поиск сектора..."
              className="w-64"
            />
            {zoneFilter.length > 0 && (
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => setZoneFilter([])}>
                <Icon name="X" size={12} className="mr-1" />
                Сбросить
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredDetections.length} из {detections.length}
            </span>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[420px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Дата / Время / Камера</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Зона</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Угроза / Статус</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Фото</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Видео</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Верификация</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetections.map((d) => {
                      const confirmed = d.confirmed;
                      return (
                        <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground font-mono">{d.id}</td>
                          <td className="px-4 py-3 font-mono text-xs">
                            <div>{d.date}</div>
                            <div className="text-muted-foreground">{d.time}</div>
                            <div className="text-muted-foreground/70 mt-0.5 font-sans text-[11px]">{d.camera}</div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <div className="text-foreground">{d.type}</div>
                            <div>{d.zone || '—'}</div>
                            <div className="text-[11px] text-muted-foreground/70">
                              {d.altitude > 0 ? `${d.altitude} м` : ''}{d.altitude > 0 && d.speed > 0 ? ' · ' : ''}{d.speed > 0 ? `${d.speed} км/ч` : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-start gap-1">
                              <Badge variant="outline" className={threatColor(d.threat)}>
                                {threatLabel(d.threat)}
                              </Badge>
                              <Badge variant="outline" className={statusColor(d.status)}>
                                {statusLabel(d.status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {d.photo_url ? (
                              <button
                                onClick={() => onPhotoClick({ url: d.photo_url as string, detection: d })}
                                className="w-16 h-12 rounded overflow-hidden bg-muted block hover:ring-2 hover:ring-primary transition-all"
                              >
                                <img src={d.photo_url} alt="БПЛА" className="w-full h-full object-cover" />
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {d.photo_url ? (
                              <button
                                onClick={() => setVideoDetection(d)}
                                className="w-16 h-12 rounded overflow-hidden bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary transition-all relative group"
                              >
                                <img
                                  src={d.photo_url}
                                  alt="Видео"
                                  className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                                    <Icon name="Play" size={10} className="text-white ml-0.5" />
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {confirmed === true ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                                  <Icon name="CheckCircle" size={13} />
                                  Подтверждён
                                </span>
                                <button
                                  onClick={() => handleConfirm(d.id, false)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Изменить"
                                >
                                  <Icon name="RotateCcw" size={12} />
                                </button>
                              </div>
                            ) : confirmed === false ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                  <Icon name="XCircle" size={13} />
                                  Отрицается
                                </span>
                                <button
                                  onClick={() => handleConfirm(d.id, true)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="Изменить"
                                >
                                  <Icon name="RotateCcw" size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleConfirm(d.id, true)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-colors border border-green-600/20 whitespace-nowrap"
                                >
                                  <Icon name="Check" size={11} />
                                  Подтверждаю
                                </button>
                                <button
                                  onClick={() => handleConfirm(d.id, false)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors border border-red-600/20 whitespace-nowrap"
                                >
                                  <Icon name="X" size={11} />
                                  Отрицаю
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => onDelete(d.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                              title="Удалить запись"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {loading && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Загрузка...</div>
                )}
                {!loading && filteredDetections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {detections.length === 0
                      ? 'Обнаружений пока нет. Нажмите «Добавить обнаружение».'
                      : 'Нет обнаружений в выбранных секторах'}
                  </div>
                )}
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
                {zoneStats.map((z) => (
                  <div key={z.zone}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{z.zone}</span>
                      <span className="text-muted-foreground">{z.neutralized}/{z.count} нейтрализовано</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${detections.length ? (z.count / detections.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>{z.count} обнаружений</span>
                      <span>{detections.length ? Math.round((z.count / detections.length) * 100) : 0}%</span>
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
                {typeStats.map((t) => (
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


          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="p-4 space-y-2">
              {alerts.map((a) => (
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

      <BPLAVideoModal
        detection={videoDetection}
        onClose={() => setVideoDetection(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default BPLAStatsPanel;