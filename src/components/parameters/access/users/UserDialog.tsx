import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface CameraGroup {
  id: number;
  name: string;
}

const USERS_API = 'https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f';
const ROLES_API = 'https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b';
const USER_GROUPS_API = 'https://functions.poehali.dev/0fe36f4b-f699-4856-b0d3-a7f0b33a9759';
const CAMERA_GROUPS_API = 'https://functions.poehali.dev/3d64a9e4-4fd9-4f35-ae50-7dd8ed88a17d';

export default function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [cameraGroups, setCameraGroups] = useState<CameraGroup[]>([]);

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
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchUserGroups();
      fetchCameraGroups();
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
      });
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
      });
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

  const fetchCameraGroups = async () => {
    try {
      const response = await fetch(CAMERA_GROUPS_API);
      if (response.ok) {
        const data = await response.json();
        setCameraGroups(data);
      }
    } catch (error) {
      console.error('Error fetching camera groups:', error);
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
        company: formData.company.trim() || null,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="full_name">
                ФИО <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

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
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                placeholder="ivanov"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Пароль {!user && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={user ? 'Оставьте пустым для сохранения текущего' : 'Введите пароль'}
                  required={!user}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Предприятие</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="МВД"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Роль</Label>
              <Select
                value={formData.role_id}
                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
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
              <Label htmlFor="user_group_id">Группа пользователей</Label>
              <Select
                value={formData.user_group_id}
                onValueChange={(value) => setFormData({ ...formData, user_group_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу" />
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
                  {cameraGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_phone">Рабочий телефон</Label>
              <Input
                id="work_phone"
                value={formData.work_phone}
                onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
                placeholder="+7 (342) 123-45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_phone">Сотовый телефон</Label>
              <Input
                id="mobile_phone"
                value={formData.mobile_phone}
                onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                placeholder="+7 (912) 345-67-89"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : user ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
