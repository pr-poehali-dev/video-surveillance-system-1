import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface RolesTabProps {
  roles: any[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const RolesTab = ({ roles, searchQuery, setSearchQuery }: RolesTabProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" size={20} />
            Роли системы
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать роль
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая роль</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Название роли <span className="text-destructive">*</span></Label>
                  <Input placeholder="Введите название роли" required />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Input placeholder="Описание роли" />
                </div>
                <div className="space-y-2">
                  <Label>Права доступа</Label>
                  <div className="space-y-3 border rounded-lg p-3">
                    {[
                      { module: 'Камеры', permissions: ['Чтение', 'Создание', 'Редактирование', 'Удаление'] },
                      { module: 'ОРД', permissions: ['Чтение', 'Создание', 'Редактирование', 'Удаление'] },
                      { module: 'Отчеты', permissions: ['Чтение', 'Создание', 'Редактирование', 'Удаление'] },
                      { module: 'Пользователи', permissions: ['Чтение', 'Создание', 'Редактирование', 'Удаление'] },
                      { module: 'Архив фото', permissions: ['Чтение', 'Создание', 'Редактирование', 'Удаление'] },
                    ].map((item) => (
                      <div key={item.module} className="space-y-2">
                        <Label className="font-semibold text-sm">{item.module}</Label>
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          {item.permissions.map((perm) => (
                            <div key={`${item.module}-${perm}`} className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id={`${item.module}-${perm}`} 
                                className="w-4 h-4 cursor-pointer" 
                              />
                              <Label htmlFor={`${item.module}-${perm}`} className="cursor-pointer text-sm">
                                {perm}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Роль создана')}>
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по ФИО, логину, предприятию, роли..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Icon name="Search" size={16} className="mr-2" />
            Поиск
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role) => (
            <Card key={role.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon name="Shield" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{role.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Пользователей: {role.users}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
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
      </CardContent>
    </Card>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить роль?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить роль "{roleToDelete?.name}"? 
            Эта роль назначена {roleToDelete?.users} пользователям. 
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.success(`Роль "${roleToDelete?.name}" удалена`);
              setRoleToDelete(null);
              setIsDeleteDialogOpen(false);
            }}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RolesTab;