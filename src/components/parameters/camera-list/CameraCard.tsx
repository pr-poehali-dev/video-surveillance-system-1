import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Camera } from './CameraListTypes';

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (camera: Camera) => void;
}

export const CameraCard = ({ camera, onEdit, onDelete }: CameraCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Camera" size={20} className="text-primary" />
            <h3 className="font-semibold">{camera.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={camera.status === 'active' ? 'default' : 'secondary'}>
              {camera.status === 'active' ? 'Активна' : 'Неактивна'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => onEdit(camera)}>
              <Icon name="Pencil" size={16} className="mr-2" />
              Изменить
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(camera)}>
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Адрес:</span>
            <p className="font-medium">{camera.address}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Модель:</span>
            <p className="font-medium">
              {camera.manufacturer && camera.model_name
                ? `${camera.manufacturer} ${camera.model_name}`
                : 'Не указана'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Собственник:</span>
            <p className="font-medium">{camera.owner || 'Не указан'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Архив:</span>
            <p className="font-medium">{camera.archive_depth_days || 30} дней</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
