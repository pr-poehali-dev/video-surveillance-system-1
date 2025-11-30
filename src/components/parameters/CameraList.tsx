import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  model: string;
  address: string;
  owner: string;
  status: string;
  archiveDepth: number;
}

interface CameraListProps {
  cameras: Camera[];
}

export const CameraList = ({ cameras }: CameraListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);

  const filteredCameras = cameras.filter(camera => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address.toLowerCase().includes(query) ||
      camera.owner.toLowerCase().includes(query)
    );
  });

  const handleEdit = (cameraId: number) => {
    toast.info(`Редактирование камеры #${cameraId}`);
  };

  const handleDelete = (cameraId: number) => {
    toast.success(`Камера #${cameraId} удалена`);
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, адресу, собственнику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          {filteredCameras.map((camera) => (
            <Card key={camera.id}>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(camera.id)}
                    >
                      <Icon name="Pencil" size={16} className="mr-2" />
                      Изменить
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCameraToDelete(camera);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
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
                    <p className="font-medium">{camera.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Собственник:</span>
                    <p className="font-medium">{camera.owner}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Архив:</span>
                    <p className="font-medium">{camera.archiveDepth} дней</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCameras.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Camera" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Камеры не найдены</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить камеру?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить камеру "{cameraToDelete?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cameraToDelete) {
                  handleDelete(cameraToDelete.id);
                  setCameraToDelete(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};