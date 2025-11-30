import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateUserDialogProps {
  roles: any[];
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

const CreateUserDialog = ({ roles, showPassword, setShowPassword, attachedFiles, setAttachedFiles }: CreateUserDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon name="UserPlus" size={18} className="mr-2" />
          Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4 py-4 pr-4">
            <div className="space-y-2">
              <Label>ФИО <span className="text-destructive">*</span></Label>
              <Input placeholder="Фамилия Имя Отчество" required />
            </div>
            <div className="space-y-2">
              <Label>Группа пользователей <span className="text-destructive">*</span></Label>
              <Select required>
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
                <Input type="email" placeholder="user@example.com" required />
              </div>
              <div className="space-y-2">
                <Label>Логин <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input placeholder="username" required />
                  <Button variant="outline" size="icon">
                    <Icon name="RefreshCw" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Пароль <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Рабочий телефон</Label>
                <Input 
                  placeholder="+7 (___) ___-__-__" 
                  type="tel"
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
                  placeholder="+7 (___) ___-__-__" 
                  type="tel"
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
              <Select required>
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
              <Select>
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
              <Input placeholder="Дополнительная информация" />
            </div>
            
            <div className="space-y-2">
              <Label>Прикрепленные файлы</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachedFiles([...attachedFiles, ...files]);
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Нажмите для загрузки или перетащите файлы
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, JPG, PNG до 10 МБ
                  </p>
                </label>
              </div>
              
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Загруженные файлы:</p>
                  <div className="space-y-1">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Icon name="File" size={16} />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
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

            <Button className="w-full">
              <Icon name="UserPlus" size={18} className="mr-2" />
              Создать пользователя
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
