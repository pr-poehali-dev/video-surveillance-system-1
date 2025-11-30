import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreateUserDialog from './users/CreateUserDialog';
import UserCard from './users/UserCard';
import EditUserDialog from './users/EditUserDialog';
import DeleteUserDialog from './users/DeleteUserDialog';

interface UsersTabProps {
  users: any[];
  setUsers: (users: any[]) => void;
  roles: any[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

const UsersTab = ({ users, setUsers, roles, searchQuery, setSearchQuery, showPassword, setShowPassword, attachedFiles, setAttachedFiles }: UsersTabProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const filteredUsers = users.filter((user) =>
    user.fio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

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
              <CreateUserDialog
                roles={roles}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
              />
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
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        users={users}
        setUsers={setUsers}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
        users={users}
        setUsers={setUsers}
      />
    </>
  );
};

export default UsersTab;
