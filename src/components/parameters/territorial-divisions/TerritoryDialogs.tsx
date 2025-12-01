import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Territory, TerritoryFormData, colorOptions } from './types';

interface TerritoryDialogsProps {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  formData: TerritoryFormData;
  selectedTerritory: Territory | null;
  territoryToDelete: Territory | null;
  rootDivisions: Territory[];
  onCreateDialogChange: (open: boolean) => void;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onFormDataChange: (data: TerritoryFormData) => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TerritoryDialogs = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  formData,
  selectedTerritory,
  territoryToDelete,
  rootDivisions,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onFormDataChange,
  onCreate,
  onEdit,
  onDelete,
}: TerritoryDialogsProps) => {
  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Название территории *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Например: Центральный район"
              />
            </div>
            <div>
              <Label htmlFor="create-parent">Родительская территория</Label>
              <Select
                value={formData.parent_id?.toString() || 'none'}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, parent_id: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger id="create-parent">
                  <SelectValue placeholder="Без родительской территории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без родительской территории</SelectItem>
                  {rootDivisions.map((division) => (
                    <SelectItem key={division.id} value={division.id.toString()}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-color">Цвет</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => onFormDataChange({ ...formData, color: value })}
              >
                <SelectTrigger id="create-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${option.value} rounded`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-cameras">Количество камер</Label>
              <Input
                id="create-cameras"
                type="number"
                value={formData.camera_count}
                onChange={(e) =>
                  onFormDataChange({ ...formData, camera_count: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onCreateDialogChange(false)}>
                Отмена
              </Button>
              <Button onClick={onCreate}>Создать</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать территорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Название территории *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-parent">Родительская территория</Label>
              <Select
                value={formData.parent_id?.toString() || 'none'}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, parent_id: value === 'none' ? null : parseInt(value) })
                }
              >
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="Без родительской территории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без родительской территории</SelectItem>
                  {rootDivisions
                    .filter((d) => d.id !== selectedTerritory?.id)
                    .map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-color">Цвет</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => onFormDataChange({ ...formData, color: value })}
              >
                <SelectTrigger id="edit-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${option.value} rounded`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-cameras">Количество камер</Label>
              <Input
                id="edit-cameras"
                type="number"
                value={formData.camera_count}
                onChange={(e) =>
                  onFormDataChange({ ...formData, camera_count: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onEditDialogChange(false)}>
                Отмена
              </Button>
              <Button onClick={onEdit}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить территорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить территорию "{territoryToDelete?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
