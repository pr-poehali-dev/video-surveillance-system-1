import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  full_name: string;
  email: string;
  login: string;
  company?: string;
  role_id?: number;
  role_name?: string;
  user_group_id?: number;
  user_group_name?: string;
  camera_group_id?: number;
  camera_group_name?: string;
  work_phone?: string;
  mobile_phone?: string;
  is_online: boolean;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

interface Role {
  id: number;
  name: string;
}

interface UserGroup {
  id: number;
  name: string;
}

const USERS_API = 'https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f';
const ROLES_API = 'https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b';
const USER_GROUPS_API = 'https://functions.poehali.dev/0fe36f4b-f699-4856-b0d3-a7f0b33a9759';

const COMPANIES = [
  'МВД',
  'Администрация',
  'ФСБ',
  'Росгвардия',
  'МЧС',
  'Прокуратура',
  'Следственный комитет'
];



const CAMERA_GROUPS = [
  { id: 1, name: 'Все камеры' },
  { id: 2, name: 'Входные группы' },
  { id: 3, name: 'Парковки' },
  { id: 4, name: 'Периметр' },
  { id: 5, name: 'Внутренние помещения' }
];

export default function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    login: '',
    password: '',
    company: '',
    role_id: '',
    user_group_id: '',
    camera_group_id: '',
    work_phone: '',
    mobile_phone: '',
    note: ''
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchUserGroups();
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        login: user.login || '',
        password: '',
        company: user.company || '',
        role_id: user.role_id?.toString() || '',
        user_group_id: user.user_group_id?.toString() || '',
        camera_group_id: user.camera_group_id?.toString() || '',
        work_phone: user.work_phone || '',
        mobile_phone: user.mobile_phone || '',
        note: ''
      });
      setAttachedFiles([]);
    } else {
      setFormData({
        full_name: '',
        email: '',
        login: '',
        password: '',
        company: '',
        role_id: '',
        user_group_id: '',
        camera_group_id: '',
        work_phone: '',
        mobile_phone: '',
        note: ''
      });
      setAttachedFiles([]);
    }
  }, [user, open]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(ROLES_API);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(USER_GROUPS_API);
      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.login.trim()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (!user && !formData.password) {
      toast.error('Введите пароль для нового пользователя');
      return;
    }

    setLoading(true);

    try {
      const url = user ? `${USERS_API}?id=${user.id}` : USERS_API;
      const method = user ? 'PUT' : 'POST';

      const body: any = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        login: formData.login.trim(),
        company: formData.company || null,
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
        user_group_id: formData.user_group_id ? parseInt(formData.user_group_id) : null,
        camera_group_id: formData.camera_group_id ? parseInt(formData.camera_group_id) : null,
        work_phone: formData.work_phone.trim() || null,
        mobile_phone: formData.mobile_phone.trim() || null,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при сохранении пользователя');
      }

      toast.success(user ? 'Пользователь обновлен' : 'Пользователь создан');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Редактировать пользователя' : 'Новый пользователь'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px]">
          <form onSubmit={handleSubmit} className="space-y-4 py-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                ФИО <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Фамилия Имя Отчество"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_group_id">
                Группа пользователей <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.user_group_id}
                onValueChange={(value) => setFormData({ ...formData, user_group_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу пользователей" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login">
                  Логин <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="login"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="username"
                    required
                  />
                  <Button variant="outline" size="icon" type="button">
                    <Icon name="RefreshCw" size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Пароль {!user && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={user ? 'Оставьте пустым для сохранения текущего' : '••••••••'}
                  required={!user}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work_phone">Рабочий телефон</Label>
                <Input
                  id="work_phone"
                  value={formData.work_phone}
                  onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
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
                <Label htmlFor="mobile_phone">Сотовый телефон</Label>
                <Input
                  id="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
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
              <Label htmlFor="role_id">
                Роль <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role_id}
                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Предприятие</Label>
              <Select
                value={formData.company}
                onValueChange={(value) => setFormData({ ...formData, company: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предприятие" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera_group_id">Группа камер</Label>
              <Select
                value={formData.camera_group_id}
                onValueChange={(value) => setFormData({ ...formData, camera_group_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу камер" />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_GROUPS.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Примечание</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Дополнительная информация"
              />
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
                          type="button"
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

            <Button className="w-full" type="submit" disabled={loading}>
              <Icon name="UserPlus" size={18} className="mr-2" />
              {loading ? 'Сохранение...' : user ? 'Сохранить изменения' : 'Создать пользователя'}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}