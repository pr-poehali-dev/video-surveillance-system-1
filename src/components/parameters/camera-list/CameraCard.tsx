import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Camera" size={18} className="text-primary flex-shrink-0" />
              <h3 className="font-semibold text-lg truncate">{camera.name}</h3>
            </div>

            <div className="space-y-1.5 text-sm">
              {camera.owner && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Building2" size={14} className="flex-shrink-0" />
                  <span className="truncate">{camera.owner}</span>
                </div>
              )}

              {camera.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="MapPin" size={14} className="flex-shrink-0" />
                  <span className="truncate">{camera.address}</span>
                </div>
              )}

              {camera.territorial_division && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Map" size={14} className="flex-shrink-0" />
                  <span className="truncate">{camera.territorial_division}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Link" size={14} className="flex-shrink-0" />
                <code className="text-xs truncate bg-muted px-2 py-0.5 rounded">
                  {camera.rtsp_url}
                </code>
              </div>

              {camera.archive_depth_days && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Icon name="Archive" size={12} className="mr-1" />
                    Архив: {camera.archive_depth_days} дн.
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(camera)}
              className="h-8 w-8 p-0"
            >
              <Icon name="Pencil" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(camera)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
