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
  roles: any[];
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}

const EditUserDialog = ({ isOpen, onOpenChange, editForm, setEditForm, users, setUsers, roles, showPassword, setShowPassword }: EditUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование пользователя</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4 py-4 pr-4">
            <div className="space-y-2">
              <Label>ФИО <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Фамилия Имя Отчество"
                value={editForm.fio || ''}
                onChange={(e) => setEditForm({ ...editForm, fio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Группа пользователей <span className="text-destructive">*</span></Label>
              <Select 
                value={editForm.userGroup || ''} 
                onValueChange={(value) => setEditForm({ ...editForm, userGroup: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу пользователей" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администраторы</SelectItem>
                  <SelectItem value="operators">Операторы</SelectItem>
                  <SelectItem value="security">Служба безопасности</SelectItem>
                  <SelectItem value="analysts">Аналитики</SelectItem>
                  <SelectItem value="viewers">Наблюдатели</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Логин <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="username"
                    value={editForm.login || ''}
                    onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                    required
                  />
                  <Button variant="outline" size="icon" type="button">
                    <Icon name="RefreshCw" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Пароль</Label>
              <div className="flex gap-2">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Оставьте пустым, чтобы не менять пароль</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Рабочий телефон</Label>
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={editForm.workPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, workPhone: e.target.value })}
                  onKeyPress={(e) => {
                    if (!/[0-9+\-() ]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Сотовый телефон</Label>
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={editForm.mobilePhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, mobilePhone: e.target.value })}
                  onKeyPress={(e) => {
                    if (!/[0-9+\-() ]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Роль <span className="text-destructive">*</span></Label>
              <Select
                value={editForm.role || ''}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Группа камер</Label>
              <Select
                value={editForm.cameraGroup || ''}
                onValueChange={(value) => setEditForm({ ...editForm, cameraGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу камер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все камеры</SelectItem>
                  <SelectItem value="entrance">Входные группы</SelectItem>
                  <SelectItem value="parking">Парковки</SelectItem>
                  <SelectItem value="perimeter">Периметр</SelectItem>
                  <SelectItem value="internal">Внутренние помещения</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Примечание</Label>
              <Input
                placeholder="Дополнительная информация"
                value={editForm.note || ''}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Прикрепленные файлы</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="user-documents-edit"
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
                <label htmlFor="user-documents-edit" className="cursor-pointer">
                  <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Нажмите для загрузки или перетащите файлы
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, JPG, PNG до 10 МБ
                  </p>
                </label>
              </div>
              {editForm.documents && editForm.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Загруженные документы:</p>
                  <div className="space-y-1">
                    {editForm.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Icon name="File" size={16} />
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