import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CameraGroup {
  id: number;
  name: string;
  description: string;
  camera_ids: number[];
}

interface CameraGroupCardProps {
  group: CameraGroup;
  onEdit: (group: CameraGroup) => void;
  onDelete: (group: CameraGroup) => void;
}

export const CameraGroupCard = ({ group, onEdit, onDelete }: CameraGroupCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <Badge variant="secondary">
                <Icon name="Camera" size={12} className="mr-1" />
                {group.camera_ids?.length || 0} камер
              </Badge>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(group)}
            >
              <Icon name="Pencil" size={16} className="mr-2" />
              Изменить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(group)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
