import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export interface SearchResult {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera: string;
  address: string;
  plate?: string;
  image?: string;
  name?: string;
  emails?: string[];
  extraImages?: string[];
}

interface SearchResultCardProps {
  result: SearchResult;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SearchResultCard = ({ result, onClick, onEdit, onDelete }: SearchResultCardProps) => {
  return (
    <div
      className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
      onClick={onClick}
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
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex items-center gap-2">
              {result.type === 'face' ? (
                <Icon name="User" size={18} className="text-secondary" />
              ) : (
                <Icon name="Hash" size={18} className="text-primary" />
              )}
              <span className="font-medium">
                {result.type === 'face' ? 'Распознано лицо' : 'Распознан ГРЗ'}
              </span>
              <Badge
                variant={result.match > 95 ? 'default' : result.match > 85 ? 'secondary' : 'outline'}
              >
                {Math.round(result.match)} совпадений
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
                title="Редактировать карточку"
              >
                <Icon name="Pencil" size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
                title="Удалить карточку"
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
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
    </div>
  );
};
