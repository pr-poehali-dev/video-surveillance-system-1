import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  users: any[];
  setUsers: (users: any[]) => void;
}

const EditUserDialog = ({ isOpen, onOpenChange, editForm, setEditForm, users, setUsers }: EditUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование пользователя</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4 py-4 pr-4">
            <div className="space-y-2">
              <Label>ФИО</Label>
              <Input
                value={editForm.fio || ''}
                onChange={(e) => setEditForm({ ...editForm, fio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Предприятие</Label>
              <Input
                value={editForm.company || ''}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Логин</Label>
                <Input
                  value={editForm.login || ''}
                  onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Рабочий телефон</Label>
                <Input
                  type="tel"
                  value={editForm.workPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, workPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Сотовый телефон</Label>
                <Input
                  type="tel"
                  value={editForm.mobilePhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, mobilePhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select
                value={editForm.role || ''}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Администратор">Администратор</SelectItem>
                  <SelectItem value="Оператор">Оператор</SelectItem>
                  <SelectItem value="Наблюдатель">Наблюдатель</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Примечание</Label>
              <Input
                value={editForm.note || ''}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Документы пользователя</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="user-documents"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setEditForm({
                        ...editForm,
                        documents: [...(editForm.documents || []), ...files.map((f) => f.name)],
                      });
                      toast.success(`Загружено ${files.length} файлов`);
                    }
                  }}
                />
                <label htmlFor="user-documents" className="cursor-pointer">
                  <Icon name="Upload" size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Загрузить документы</p>
                </label>
              </div>
              {editForm.documents && editForm.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Загруженные документы:</p>
                  <div className="space-y-1">
                    {editForm.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" size={16} />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              documents: editForm.documents.filter((_: any, i: number) => i !== index),
                            });
                          }}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setUsers(users.map((u) => (u.id === editForm.id ? editForm : u)));
                onOpenChange(false);
                toast.success('Данные пользователя обновлены');
              }}
            >
              Сохранить изменения
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
