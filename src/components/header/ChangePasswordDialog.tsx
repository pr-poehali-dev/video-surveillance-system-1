import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) setPasswordForm({ current: '', next: '', confirm: '' });
  };

  const handleChangePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Новые пароли не совпадают');
      return;
    }
    if (passwordForm.next.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('Не удалось определить пользователя');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: passwordForm.current, password: passwordForm.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Ошибка смены пароля');
      } else {
        toast.success('Пароль успешно изменён');
        onOpenChange(false);
        setPasswordForm({ current: '', next: '', confirm: '' });
      }
    } catch {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="KeyRound" size={20} />
            Смена пароля
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Текущий пароль</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Введите текущий пароль"
              />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name={showPasswords.current ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Новый пароль</Label>
            <div className="relative">
              <Input
                type={showPasswords.next ? 'text' : 'password'}
                value={passwordForm.next}
                onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                placeholder="Минимум 6 символов"
              />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, next: !showPasswords.next })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name={showPasswords.next ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Подтвердите новый пароль</Label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Повторите новый пароль"
              />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name={showPasswords.confirm ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleChangePassword} disabled={passwordLoading || !passwordForm.current || !passwordForm.next || !passwordForm.confirm}>
            {passwordLoading ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> : <Icon name="Check" size={16} className="mr-2" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
