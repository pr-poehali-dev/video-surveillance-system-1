import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface OwnerGroupFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    name: string;
    description: string;
    responsible_full_name: string;
    responsible_phone: string;
    responsible_email: string;
    responsible_position: string;
  };
  onFormChange: (field: string, value: string) => void;
  title: string;
  submitLabel: string;
}

export const OwnerGroupFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  title,
  submitLabel,
}: OwnerGroupFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Название <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="Введите название собственника"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              value={formData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="Краткое описание (необязательно)"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="User" size={18} />
              Ответственное лицо
            </h4>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>ФИО ответственного</Label>
                <Input
                  value={formData.responsible_full_name}
                  onChange={(e) => onFormChange('responsible_full_name', e.target.value)}
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="space-y-2">
                <Label>Должность</Label>
                <Input
                  value={formData.responsible_position}
                  onChange={(e) => onFormChange('responsible_position', e.target.value)}
                  placeholder="Директор, Руководитель отдела..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input
                    value={formData.responsible_phone}
                    onChange={(e) => onFormChange('responsible_phone', e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.responsible_email}
                    onChange={(e) => onFormChange('responsible_email', e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
