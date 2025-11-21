import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AccessManagement = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Администратор', users: 3, permissions: ['all'] },
    { id: 2, name: 'Оператор', users: 12, permissions: ['view', 'search'] },
    { id: 3, name: 'Наблюдатель', users: 8, permissions: ['view'] },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      fio: 'Иванов Иван Иванович',
      company: 'МВД',
      email: 'ivanov@mvd.ru',
      login: 'ivanov',
      workPhone: '+7 (342) 123-45-67',
      mobilePhone: '+7 (912) 345-67-89',
      role: 'Администратор',
      isOnline: true,
      note: '',
      documents: [],
    },
    {
      id: 2,
      fio: 'Петров Петр Петрович',
      company: 'Администрация',
      email: 'petrov@admin.perm.ru',
      login: 'petrov',
      workPhone: '+7 (342) 234-56-78',
      mobilePhone: '+7 (912) 456-78-90',
      role: 'Оператор',
      isOnline: false,
      note: '',
      documents: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const [sessions, setSessions] = useState([
    {
      id: 1,
      user: 'Иванов Иван Иванович',
      ip: '192.168.1.10',
      page: '/monitoring',
      startTime: new Date(Date.now() - 3600000),
      lastActivity: new Date(),
    },
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      id: 1,
      user: 'Иванов И.И.',
      action: 'Просмотр камеры',
      details: 'Камера-001',
      timestamp: new Date(Date.now() - 600000),
      ip: '192.168.1.10',
    },
    {
      id: 2,
      user: 'Петров П.П.',
      action: 'Поиск ГРЗ',
      details: 'А123ВС159',
      timestamp: new Date(Date.now() - 1800000),
      ip: '192.168.1.15',
    },
  ]);

  return (
    <Tabs defaultValue="roles" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="roles">Роли</TabsTrigger>
        <TabsTrigger value="users">Пользователи</TabsTrigger>
        <TabsTrigger value="groups">Группы</TabsTrigger>
        <TabsTrigger value="sessions">Сеансы</TabsTrigger>
        <TabsTrigger value="audit">Журнал</TabsTrigger>
      </TabsList>

      <TabsContent value="roles">
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
                      <Label>Название роли</Label>
                      <Input placeholder="Введите название роли" />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Input placeholder="Описание роли" />
                    </div>
                    <div className="space-y-2">
                      <Label>Права доступа</Label>
                      <div className="space-y-2 border rounded-lg p-3">
                        {['Просмотр камер', 'Управление камерами', 'ОРД поиск', 'Отчеты', 'Управление пользователями'].map((perm) => (
                          <div key={perm} className="flex items-center gap-2">
                            <input type="checkbox" id={perm} className="w-4 h-4" />
                            <Label htmlFor={perm} className="cursor-pointer">{perm}</Label>
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
                        <Button variant="outline" size="sm">
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
      </TabsContent>

      <TabsContent value="users">
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
                        <Input placeholder="Фамилия Имя Отчество" />
                      </div>
                      <div className="space-y-2">
                        <Label>Предприятие *</Label>
                        <Input placeholder="Название организации" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" placeholder="user@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Логин</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Автогенерация" />
                            <Button variant="outline" size="icon">
                              <Icon name="RefreshCw" size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль *</Label>
                        <div className="flex gap-2">
                          <Input type="password" placeholder="••••••••" />
                          <Button variant="outline" size="icon">
                            <Icon name="Key" size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Рабочий телефон</Label>
                          <Input placeholder="+7 (___) ___-__-__" />
                        </div>
                        <div className="space-y-2">
                          <Label>Сотовый телефон</Label>
                          <Input placeholder="+7 (___) ___-__-__" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Роль</Label>
                        <Select>
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
      </TabsContent>

      <TabsContent value="groups">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FolderTree" size={20} />
              Группы пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="FolderTree" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Древовидная структура групп</h3>
              <p className="text-muted-foreground mb-4">
                Организуйте пользователей в иерархические группы
              </p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать группу
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sessions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Активные сеансы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.user}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Icon name="Globe" size={12} />
                              {session.ip}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="FileText" size={12} />
                              {session.page}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {session.lastActivity.toLocaleTimeString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.success('Сеанс завершен')}>
                        <Icon name="LogOut" size={14} className="mr-1" />
                        Завершить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="ScrollText" size={20} />
                Журнал действий
              </CardTitle>
              <Button variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {auditLog.map((log) => (
                  <Card key={log.id} className="border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant="secondary">{log.user}</Badge>
                          <span className="font-medium">{log.action}</span>
                          <span className="text-muted-foreground">{log.details}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{log.timestamp.toLocaleString('ru-RU')}</span>
                          <span>{log.ip}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AccessManagement;