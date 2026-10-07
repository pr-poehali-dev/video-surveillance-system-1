import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';
import { Recognition, toMapPoints } from './ordApi';
import { RecognitionVideoDialog } from './RecognitionVideoDialog';

interface FaceHistoryResultsProps {
  results: Recognition[];
  searched: boolean;
  loading: boolean;
  queryImage?: string;
}

export const FaceHistoryResults = ({ results, searched, loading, queryImage }: FaceHistoryResultsProps) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={20} />
            Результаты поиска
            <Badge variant="secondary" className="ml-1">{results.length} совпадений</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
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
              <p>{loading ? 'Загрузка...' : searched ? 'Совпадений не найдено' : 'Задайте период и нажмите «Запустить исторический поиск»'}</p>
            </div>
          )}
          <ScrollArea className="max-h-[560px]">
            <div className="flex flex-col divide-y">
              {results.map((det, index) => (
                <div key={det.id} className="flex gap-4 items-start p-4">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Искомое</p>
                    <div className="w-28 h-36 rounded-lg overflow-hidden bg-muted">
                      {queryImage ? (
                        <img src={queryImage} alt="Искомое" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="User" size={40} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Найдено</p>
                    <div className="relative w-28 h-36 rounded-lg overflow-hidden bg-muted">
                      {det.image ? (
                        <img src={det.image} alt="Найденное лицо" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="User" size={40} className="text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        className="absolute bottom-1.5 right-1.5 text-xs px-1.5 py-0"
                        variant={det.match > 92 ? 'default' : 'secondary'}
                      >
                        {det.match}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 py-1">
                    <p className="font-semibold text-sm">{det.camera}</p>
                    <p className="text-xs text-muted-foreground">{det.address}</p>
                    <p className="text-xs text-muted-foreground">{det.time}</p>
                    <div className="flex gap-1 pt-2">
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