import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { User, UserFormData, USERS_API } from './userDialogTypes';
import { useUserDialogData } from './useUserDialogData';
import { UserFormFields } from './UserFormFields';
import { FileUploadSection } from './FileUploadSection';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<(File | string)[]>([]);

  const { roles, userGroups, cameraGroups } = useUserDialogData(open);

  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    position: '',
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
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        position: user.position || '',
        email: user.email || '',
        login: user.login || '',
        password: '',
        company: user.company || '',
        role_id: user.role_id?.toString() || '',
        user_group_id: user.user_group_id?.toString() || '',
        camera_group_id: user.camera_group_id?.toString() || '',
        work_phone: user.work_phone || '',
        mobile_phone: user.mobile_phone || '',
        note: user.note || ''
      });
      setAttachedFiles(user.attached_files || []);
    } else {
      setFormData({
        full_name: '',
        position: '',
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
        position: formData.position.trim() || null,
        email: formData.email.trim(),
        login: formData.login.trim(),
        company: formData.company || null,
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
        user_group_id: formData.user_group_id ? parseInt(formData.user_group_id) : null,
        camera_group_id: formData.camera_group_id ? parseInt(formData.camera_group_id) : null,
        work_phone: formData.work_phone.trim() || null,
        mobile_phone: formData.mobile_phone.trim() || null,
        note: formData.note.trim() || null,
        attached_files: attachedFiles.length > 0 ? attachedFiles.map(f => typeof f === 'string' ? f : f.name) : null,
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
            <UserFormFields
              formData={formData}
              setFormData={setFormData}
              roles={roles}
              userGroups={userGroups}
              cameraGroups={cameraGroups}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isEditing={!!user}
            />

            <FileUploadSection
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
            />

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}