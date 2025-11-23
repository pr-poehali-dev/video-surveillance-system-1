import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const [editForm, setEditForm] = useState<any>({});

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="UserPlus" size={18} className="mr-2" />
                    Добавить пользователя
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Новый пользователь</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-4 py-4 pr-4">
                      <div className="space-y-2">
                        <Label>ФИО *</Label>
                        <Input placeholder="Фамилия Имя Отчество" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Предприятие *</Label>
                        <Input placeholder="Название организации" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" placeholder="user@example.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Логин *</Label>
                          <div className="flex gap-2">
                            <Input placeholder="username" required />
                            <Button variant="outline" size="icon">
                              <Icon name="RefreshCw" size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль *</Label>
                        <div className="flex gap-2">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                          >
                            <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Рабочий телефон</Label>
                          <Input 
                            placeholder="+7 (___) ___-__-__" 
                            type="tel"
                            onKeyPress={(e) => {
                              if (!/[0-9+\-() ]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Сотовый телефон</Label>
                          <Input 
                            placeholder="+7 (___) ___-__-__" 
                            type="tel"
                            onKeyPress={(e) => {
                              if (!/[0-9+\-() ]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Роль *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Примечание</Label>
                        <Input placeholder="Дополнительная информация" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Прикрепленные файлы</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => {
                              if (e.target.files) {
                                setAttachedFiles(Array.from(e.target.files));
                                toast.success(`Прикреплено файлов: ${e.target.files.length}`);
                              }
                            }}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Icon name="Upload" size={24} className="mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Нажмите для загрузки файлов</p>
                          </label>
                        </div>
                        {attachedFiles.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                  <Icon name="File" size={16} />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
                                    toast.success('Файл удален');
                                  }}
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button className="w-full" onClick={() => toast.success('Пользователь создан')}>
                        Создать пользователя
                      </Button>
                    </div>
                  </ScrollArea>
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
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {users
                .filter((user) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    user.fio.toLowerCase().includes(query) ||
                    user.login.toLowerCase().includes(query) ||
                    user.company.toLowerCase().includes(query) ||
                    user.role.toLowerCase().includes(query)
                  );
                })
                .map((user) => (
                <Card key={user.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Icon name="User" size={24} className="text-secondary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.fio}</h4>
                            {user.isOnline && (
                              <Badge variant="secondary" className="text-xs">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                Онлайн
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditForm(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Icon name="Edit" size={14} className="mr-1" />
                          Редактировать
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Вы уверены, что хотите удалить пользователя ${user.fio}?`)) {
                              setUsers(users.filter((u) => u.id !== user.id));
                              toast.success('Пользователь удален');
                            }
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Логин</p>
                        <p className="font-medium">{user.login}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Роль</p>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Рабочий</p>
                        <p className="font-medium">{user.workPhone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Мобильный</p>
                        <p className="font-medium">{user.mobilePhone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label>ФИО</Label>
                <Input
                  value={editForm.fio || ''}
                  onChange={(e) => setEditForm({ ...editForm, fio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Предприятие</Label>
                <Input
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Логин</Label>
                  <Input
                    value={editForm.login || ''}
                    onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Рабочий телефон</Label>
                  <Input
                    value={editForm.workPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, workPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Мобильный телефон</Label>
                  <Input
                    value={editForm.mobilePhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, mobilePhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={editForm.role || ''}
                  onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Администратор">Администратор</SelectItem>
                    <SelectItem value="Оператор">Оператор</SelectItem>
                    <SelectItem value="Наблюдатель">Наблюдатель</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Примечание</Label>
                <Input
                  value={editForm.note || ''}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Документы пользователя</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="user-documents"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setEditForm({
                          ...editForm,
                          documents: [...(editForm.documents || []), ...files.map((f) => f.name)],
                        });
                        toast.success(`Загружено ${files.length} файлов`);
                      }
                    }}
                  />
                  <label htmlFor="user-documents" className="cursor-pointer">
                    <Icon name="Upload" size={24} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Загрузить документы</p>
                  </label>
                </div>
                {editForm.documents && editForm.documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Загруженные документы:</p>
                    <div className="space-y-1">
                      {editForm.documents.map((doc: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Icon name="FileText" size={16} />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                documents: editForm.documents.filter((_: any, i: number) => i !== index),
                              });
                            }}
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setUsers(users.map((u) => (u.id === editForm.id ? editForm : u)));
                  setIsEditDialogOpen(false);
                  toast.success('Данные пользователя обновлены');
                }}
              >
                Сохранить изменения
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersTab;