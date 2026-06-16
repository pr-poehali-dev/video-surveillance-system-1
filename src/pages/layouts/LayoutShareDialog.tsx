import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { LayoutConfig, SystemUser, SharedUser, USERS_API } from './types';

interface LayoutShareDialogProps {
  layout: LayoutConfig | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const LayoutShareDialog = ({ layout, open, onOpenChange }: LayoutShareDialogProps) => {
  const [loginQuery, setLoginQuery] = useState('');
  const [allUsers, setAllUsers] = useState<SystemUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);

  useEffect(() => {
    if (!open) return;
    setSearching(true);
    fetch(USERS_API)
      .then((r) => r.json())
      .then((data) => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => setAllUsers([]))
      .finally(() => setSearching(false));
  }, [open]);

  const searchResults = loginQuery.trim().length > 0
    ? allUsers.filter(
        (u) =>
          u.login.toLowerCase().includes(loginQuery.toLowerCase()) ||
          u.full_name.toLowerCase().includes(loginQuery.toLowerCase())
      ).filter((u) => !sharedUsers.find((s) => s.user.id === u.id)).slice(0, 6)
    : [];

  const addUser = (user: SystemUser) => {
    if (sharedUsers.find((s) => s.user.id === user.id)) return;
    setSharedUsers((prev) => [...prev, { user, canView: true, canEdit: false }]);
    setLoginQuery('');
  };

  const removeUser = (id: number) => setSharedUsers((prev) => prev.filter((s) => s.user.id !== id));

  const togglePerm = (id: number, perm: 'canView' | 'canEdit') => {
    setSharedUsers((prev) =>
      prev.map((s) => s.user.id === id ? { ...s, [perm]: !s[perm] } : s)
    );
  };

  const handleShare = () => {
    if (sharedUsers.length === 0) { toast.error('Добавьте хотя бы одного пользователя'); return; }
    toast.success(`Раскладка «${layout?.name}» открыта для ${sharedUsers.length} пользователей`);
    onOpenChange(false);
    setSharedUsers([]);
    setLoginQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Share2" size={18} />
            Поделиться раскладкой
          </DialogTitle>
          <DialogDescription>«{layout?.name}»</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Логин пользователя</Label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Введите логин..."
                value={loginQuery}
                onChange={(e) => setLoginQuery(e.target.value)}
                className="pl-9"
              />
              {searching && (
                <Icon name="Loader2" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors"
                    onClick={() => addUser(u)}
                  >
                    <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{u.login}</div>
                      <div className="text-xs text-muted-foreground">{u.full_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Доступ пользователей</Label>
              <div className="border rounded-md divide-y">
                {sharedUsers.map(({ user, canView, canEdit }) => (
                  <div key={user.id} className="flex items-center gap-3 px-3 py-2">
                    <Icon name="User" size={16} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user.login}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.full_name}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer text-xs">
                        <Checkbox checked={canView} onCheckedChange={() => togglePerm(user.id, 'canView')} />
                        Чтение
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-xs">
                        <Checkbox checked={canEdit} onCheckedChange={() => togglePerm(user.id, 'canEdit')} />
                        Правка
                      </label>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeUser(user.id)}>
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={handleShare}>
              <Icon name="Share2" size={16} className="mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
