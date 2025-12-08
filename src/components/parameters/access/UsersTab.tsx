import { useState, useEffect } from 'react';
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
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении пользователя');
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
              <Button onClick={handleCreateClick}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить пользователя
              </Button>
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
    </>
  );
};

export default UsersTab;
