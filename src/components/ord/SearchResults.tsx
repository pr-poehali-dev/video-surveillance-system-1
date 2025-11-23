import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

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

export const SearchResults = ({ results }: SearchResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Результаты мониторинга лиц</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
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
  );
};