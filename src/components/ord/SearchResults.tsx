import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { YandexMap } from './YandexMap';

interface SearchResult {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera: string;
  address: string;
  plate?: string;
  image?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

const QUERY_IMAGE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';

const MOCK_MAP_POINTS = [
  { lat: 56.8389, lng: 60.6057, label: 'Камера-001', time: '2024-11-21 14:32:15' },
  { lat: 56.8412, lng: 60.6124, label: 'Камера-003', time: '2024-11-21 14:45:02' },
  { lat: 56.8350, lng: 60.5990, label: 'Камера-007', time: '2024-11-21 15:01:38' },
];

export const SearchResults = ({ results }: SearchResultsProps) => {
  const [selected, setSelected] = useState<SearchResult | null>(null);

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Результаты мониторинга лиц</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelected(result)}
                >
                  <div className="flex gap-4">
                    {result.image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={result.image}
                          alt="Кадр распознавания"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.type === 'face' ? (
                            <Icon name="User" size={18} className="text-secondary" />
                          ) : (
                            <Icon name="Hash" size={18} className="text-primary" />
                          )}
                          <span className="font-medium">
                            {result.type === 'face' ? 'Распознано лицо' : 'Распознан ГРЗ'}
                          </span>
                        </div>
                        <Badge
                          variant={result.match > 95 ? 'default' : result.match > 85 ? 'secondary' : 'outline'}
                        >
                          {result.match}% совпадение
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Время:</span>
                        <p className="font-medium">{result.time}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Камера:</span>
                        <p className="font-medium">{result.camera}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Адрес:</span>
                        <p className="font-medium">{result.address}</p>
                      </div>
                      {result.plate && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">ГРЗ:</span>
                          <p className="font-medium font-mono">{result.plate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Результаты поиска появятся здесь</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.type === 'face' ? (
                <Icon name="User" size={18} className="text-secondary" />
              ) : (
                <Icon name="Hash" size={18} className="text-primary" />
              )}
              {selected?.type === 'face' ? 'Распознавание лица' : 'Распознавание ГРЗ'}
              <Badge
                className="ml-2"
                variant={selected && selected.match > 95 ? 'default' : selected && selected.match > 85 ? 'secondary' : 'outline'}
              >
                {selected?.match}% совпадение
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <Icon name="Info" size={14} className="mr-1" />
                  Информация
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Icon name="MapPin" size={14} className="mr-1" />
                  На карте
                </TabsTrigger>
                <TabsTrigger value="archive">
                  <Icon name="Video" size={14} className="mr-1" />
                  Видеоархив
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Искомое изображение</p>
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={QUERY_IMAGE} alt="Искомое изображение" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Найденное изображение</p>
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                      {selected.image ? (
                        <img src={selected.image} alt="Найденное изображение" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Icon name="ImageOff" size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                  <div>
                    <span className="text-muted-foreground text-xs">Время обнаружения</span>
                    <p className="font-medium">{selected.time}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Камера</span>
                    <p className="font-medium">{selected.camera}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs">Адрес</span>
                    <p className="font-medium">{selected.address}</p>
                  </div>
                  {selected.plate && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-xs">Государственный регистрационный знак</span>
                      <p className="font-medium font-mono text-lg">{selected.plate}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="map" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Info" size={14} />
                    <span>Обнаружено на {MOCK_MAP_POINTS.length} камерах. Маршрут показан пунктирной линией.</span>
                  </div>
                  <div className="h-80">
                    <YandexMap points={MOCK_MAP_POINTS} />
                  </div>
                  <div className="space-y-2">
                    {MOCK_MAP_POINTS.map((point, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/50">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{point.label}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{point.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="archive" className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Info" size={14} />
                    <span>Фрагменты видеоархива с момента обнаружения</span>
                  </div>
                  {MOCK_MAP_POINTS.map((point, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Icon name="Video" size={14} className="text-primary" />
                          {point.label}
                        </div>
                        <span className="text-xs text-muted-foreground">{point.time}</span>
                      </div>
                      <div className="bg-black aspect-video flex items-center justify-center relative">
                        <div className="text-center text-white/60">
                          <Icon name="PlayCircle" size={48} className="mx-auto mb-2" />
                          <p className="text-sm">Видеоархив недоступен</p>
                          <p className="text-xs mt-1">Фрагмент: ±30 сек от момента обнаружения</p>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {point.label} • {point.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
