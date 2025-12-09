import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Role, UserGroup, CameraGroup, UserFormData } from './userDialogTypes';

interface UserFormFieldsProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  roles: Role[];
  userGroups: UserGroup[];
  cameraGroups: CameraGroup[];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isEditing: boolean;
}

export const UserFormFields = ({
  formData,
  setFormData,
  roles,
  userGroups,
  cameraGroups,
  showPassword,
  setShowPassword,
  isEditing
}: UserFormFieldsProps) => {
  return (
    <>
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
        <Label htmlFor="position">Должность</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="Введите должность"
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

      <div className="space-y-2">
        <Label htmlFor="login">
          Логин <span className="text-destructive">*</span>
        </Label>
        <Input
          id="login"
          value={formData.login}
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
          placeholder="login"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Пароль {!isEditing && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEditing ? 'Оставьте пустым для сохранения текущего' : 'Введите пароль'}
            required={!isEditing}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Icon
              name="Mail"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@mail.ru"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_phone">Рабочий телефон</Label>
          <div className="relative">
            <Icon
              name="Phone"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="work_phone"
              type="tel"
              value={formData.work_phone}
              onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_phone">Мобильный телефон</Label>
        <div className="relative">
          <Icon
            name="Smartphone"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="mobile_phone"
            type="tel"
            value={formData.mobile_phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                mobile_phone: e.target.value
              })
            }
            placeholder="+7 (999) 123-45-67"
            className="pl-10"
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
        <Label htmlFor="note">Примечание</Label>
        <Input
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Дополнительная информация"
        />
      </div>
    </>
  );
};