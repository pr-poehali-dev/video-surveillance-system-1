import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Role } from '@/types/permissions';
import { RoleDialog } from './RoleDialog';
import { Badge } from '@/components/ui/badge';

interface RolesTabProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const ROLES_API = 'https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b';

const RolesTab = ({ searchQuery, setSearchQuery }: RolesTabProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(ROLES_API);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Ошибка при загрузке ролей');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(`${ROLES_API}?id=${roleToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при удалении роли');
      }

      toast.success('Роль удалена');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении роли');
    } finally {
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleCreateClick = () => {
    setRoleToEdit(null);
    setIsRoleDialogOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setRoleToEdit(role);
    setIsRoleDialogOpen(true);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPermissionsCount = (role: Role) => {
    let count = 0;
    const countPerms = (obj: any) => {
      Object.values(obj).forEach((val) => {
        if (typeof val === 'boolean' && val === true) {
          count++;
        } else if (typeof val === 'object' && val !== null) {
          countPerms(val);
        }
      });
    };
    countPerms(role.permissions);
    return count;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" size={20} />
              Роли системы
            </CardTitle>
            <Button onClick={handleCreateClick}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать роль
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по названию или описанию..."
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
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Роли не найдены' : 'Нет ролей'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Shield" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{role.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {getPermissionsCount(role)} прав
                            </Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {role.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Пользователей: {role.users_count}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(role)}
                        >
                          <Icon name="Edit" size={14} className="mr-1" />
                          Изменить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRoleToDelete(role);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={roleToEdit}
        onSuccess={fetchRoles}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить роль?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleToDelete?.users_count && roleToDelete.users_count > 0 ? (
                <span className="text-destructive">
                  Эту роль нельзя удалить, так как она назначена {roleToDelete.users_count}{' '}
                  пользовател{roleToDelete.users_count === 1 ? 'ю' : 'ям'}.
                  Сначала переназначьте роли этим пользователям.
                </span>
              ) : (
                `Вы уверены, что хотите удалить роль "${roleToDelete?.name}"? Это действие нельзя отменить.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            {(!roleToDelete?.users_count || roleToDelete.users_count === 0) && (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Удалить
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RolesTab;