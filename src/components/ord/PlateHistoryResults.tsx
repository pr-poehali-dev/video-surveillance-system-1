import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { Recognition, toMapPoints } from './ordApi';
import { RecognitionVideoDialog } from './RecognitionVideoDialog';

interface PlateHistoryResultsProps {
  results: Recognition[];
  searched: boolean;
  loading: boolean;
}

export const PlateHistoryResults = ({ results, searched, loading }: PlateHistoryResultsProps) => {
  const [mapDetIndex, setMapDetIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoDetIndex, setVideoDetIndex] = useState(0);

  const mapPoints = useMemo(
    () => (mapDetIndex !== null && results[mapDetIndex] ? toMapPoints([results[mapDetIndex]]) : []),
    [mapDetIndex, results]
  );

  const openVideo = useCallback((index: number) => {
    setVideoDetIndex(index);
    setVideoOpen(true);
  }, []);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Hash" size={20} />
            Результаты поиска
            <Badge variant="secondary" className="ml-1">{results.length} совпадений</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mapDetIndex !== null && (
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border" style={{ height: 200 }}>
              {mapPoints.length > 0 ? (
                <YandexMap points={mapPoints} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  У камеры не указаны координаты
                </div>
              )}
            </div>
          )}
          {results.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Icon name="Search" size={40} className="mx-auto mb-3 opacity-50" />
              <p>{loading ? 'Загрузка...' : searched ? 'Совпадений не найдено' : 'Введите номер и нажмите «Найти в истории»'}</p>
            </div>
          )}
          <ScrollArea className="max-h-[480px]">
            <div className="divide-y">
              {results.map((det, index) => (
                <div key={det.id} className="flex items-start gap-4 px-4 py-3">
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-muted border">
                    {(det.carImage ?? det.image) ? (
                      <img src={(det.carImage ?? det.image)} alt="Фото автомобиля" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Car" size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-white border-2 border-black rounded px-2 py-0.5 font-mono font-bold text-sm tracking-widest text-black">
                        {det.plate}
                      </div>
                      <Badge
                        className="text-xs px-1.5"
                        variant={det.match > 92 ? 'default' : 'secondary'}
                      >
                        {det.match}%
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{det.camera}</p>
                    <p className="text-xs text-muted-foreground truncate">{det.address} · {det.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={mapDetIndex === index ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setMapDetIndex(mapDetIndex === index ? null : index)}
                    >
                      <Icon name="MapPin" size={12} className="mr-1" />
                      На карте
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => openVideo(index)}
                    >
                      <Icon name="Video" size={12} className="mr-1" />
                      Видео
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <RecognitionVideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        items={results}
        index={videoDetIndex}
        onIndexChange={setVideoDetIndex}
      />
    </>
  );
};