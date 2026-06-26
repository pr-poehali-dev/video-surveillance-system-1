import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import UserCard from './users/UserCard';
import UserDialog from './users/UserDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UsersTabProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const USERS_API = 'https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f';

const UsersTab = ({ searchQuery, setSearchQuery }: UsersTabProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginHistoryUser, setLoginHistoryUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_API);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setUserToEdit(null);
    setIsUserDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setIsUserDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`${USERS_API}?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при удалении пользователя');
      }

      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при удалении пользователя');
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMockLoginHistory = (userId: number) => {
    const base = new Date();
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date(base);
      d.setHours(d.getHours() - i * 17 - Math.floor(Math.random() * 5));
      const ips = ['192.168.1.10', '10.0.0.5', '172.16.0.3', '192.168.0.22'];
      const browsers = ['Chrome 124', 'Firefox 126', 'Safari 17', 'Edge 124'];
      return {
        id: userId * 100 + i,
        timestamp: d.toLocaleString('ru-RU'),
        ip: ips[(userId + i) % ips.length],
        browser: browsers[i % browsers.length],
        success: i !== 2,
      };
    });
  };

  const exportCSV = useCallback(() => {
    const headers = ['ФИО', 'Email', 'Логин', 'Роль', 'Предприятие', 'Рабочий телефон', 'Мобильный телефон', 'Онлайн', 'Дата создания'];
    const rows = filteredUsers.map((u) => [
      u.full_name,
      u.email,
      u.login,
      u.role_name || '',
      u.company || '',
      u.work_phone || '',
      u.mobile_phone || '',
      u.is_online ? 'Да' : 'Нет',
      new Date(u.created_at).toLocaleDateString('ru-RU'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Файл выгружен');
  }, [filteredUsers]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                Пользователи системы
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCSV}>
                  <Icon name="Download" size={18} className="mr-2" />
                  Выгрузить CSV
                </Button>
                <Button onClick={handleCreateClick}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить пользователя
                </Button>
              </div>

            </div>
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по ФИО, email или предприятию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEditClick}
                    onDelete={(user) => {
                      setUserToDelete(user);
                      setIsDeleteDialogOpen(true);
                    }}
                    onLoginHistory={setLoginHistoryUser}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={userToEdit}
        onSuccess={fetchUsers}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя "{userToDelete?.full_name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!loginHistoryUser} onOpenChange={(v) => { if (!v) setLoginHistoryUser(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="History" size={18} />
              История входов — {loginHistoryUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[420px]">
            <div className="divide-y">
              {loginHistoryUser && getMockLoginHistory(loginHistoryUser.id).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2.5 px-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.timestamp}</p>
                    <p className="text-xs text-muted-foreground">{entry.ip} · {entry.browser}</p>
                  </div>
                  <Badge variant={entry.success ? 'default' : 'destructive'} className="text-xs flex-shrink-0">
                    {entry.success ? 'Успешно' : 'Отказано'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersTab;