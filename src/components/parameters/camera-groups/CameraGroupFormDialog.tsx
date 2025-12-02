import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Camera {
  id: number;
  name: string;
  address: string;
  owner: string;
  territorial_division: string;
}

interface Owner {
  id: number;
  name: string;
}

interface Division {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  camera_ids: number[];
}

interface CameraGroupFormDialogProps {
  open: boolean;
  isEdit: boolean;
  formData: FormData;
  cameras: Camera[];
  owners: Owner[];
  divisions: Division[];
  searchQuery: string;
  selectedOwner: string;
  selectedDivision: string;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: FormData) => void;
  onSearchChange: (query: string) => void;
  onOwnerChange: (owner: string) => void;
  onDivisionChange: (division: string) => void;
  onToggleCamera: (cameraId: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const CameraGroupFormDialog = ({
  open,
  isEdit,
  formData,
  cameras,
  owners,
  divisions,
  searchQuery,
  selectedOwner,
  selectedDivision,
  onOpenChange,
  onFormDataChange,
  onSearchChange,
  onOwnerChange,
  onDivisionChange,
  onToggleCamera,
  onSubmit,
  onCancel,
}: CameraGroupFormDialogProps) => {
  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = !selectedOwner || camera.owner === selectedOwner;
    const matchesDivision = !selectedDivision || camera.territorial_division === selectedDivision;
    
    return matchesSearch && matchesOwner && matchesDivision;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать группу' : 'Создать группу камер'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Измените данные группы камер' : 'Выберите камеры для новой группы'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Название группы <span className="text-red-500">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="Введите название"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Описание группы (опционально)"
              rows={3}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label>Камеры в группе</Label>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Поиск по названию/адресу</Label>
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Фильтр по собственнику</Label>
                <Select value={selectedOwner} onValueChange={onOwnerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все собственники" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все собственники</SelectItem>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.name}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Фильтр по территории</Label>
                <Select value={selectedDivision} onValueChange={onDivisionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все территории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все территории</SelectItem>
                    {divisions.map(division => (
                      <SelectItem key={division.id} value={division.name}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-2">
                {filteredCameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md"
                  >
                    <Checkbox
                      checked={formData.camera_ids.includes(camera.id)}
                      onCheckedChange={() => onToggleCamera(camera.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{camera.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{camera.address}</p>
                    </div>
                  </div>
                ))}
                {filteredCameras.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Камеры не найдены
                  </p>
                )}
              </div>
            </ScrollArea>

            <p className="text-sm text-muted-foreground">
              Выбрано: {formData.camera_ids.length} камер
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            <Icon name={isEdit ? "Save" : "Plus"} size={18} className="mr-2" />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
