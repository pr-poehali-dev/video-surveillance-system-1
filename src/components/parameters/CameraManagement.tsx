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

interface OwnerGroup {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children?: OwnerGroup[];
}

const CameraManagement = () => {
  const [testingStream, setTestingStream] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerGroups, setOwnerGroups] = useState<OwnerGroup[]>([
    {
      id: '1',
      name: 'МВД',
      description: 'Министерство внутренних дел',
      parentId: null,
      children: [
        { id: '1-1', name: 'Полиция', parentId: '1', children: [] },
        { id: '1-2', name: 'ГИБДД', parentId: '1', children: [] },
      ],
    },
    {
      id: '2',
      name: 'Администрация',
      description: 'Городская администрация',
      parentId: null,
      children: [
        { id: '2-1', name: 'Центральный район', parentId: '2', children: [] },
        { id: '2-2', name: 'Ленинский район', parentId: '2', children: [] },
      ],
    },
    {
      id: '3',
      name: 'МЧС',
      description: 'Министерство по чрезвычайным ситуациям',
      parentId: null,
      children: [],
    },
  ]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1', '2']));
  const [editingGroup, setEditingGroup] = useState<OwnerGroup | null>(null);
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const cameras = [
    {
      id: 1,
      name: 'Камера-001',
      rtspUrl: 'rtsp://admin:pass@192.168.1.10:554/stream',
      model: 'Hikvision DS-2CD2143G0-I',
      address: 'г. Пермь, ул. Ленина, 50',
      owner: 'МВД',
      status: 'active',
      archiveDepth: 30,
    },
    {
      id: 2,
      name: 'Камера-002',
      rtspUrl: 'rtsp://admin:pass@192.168.1.11:554/stream',
      model: 'Dahua IPC-HFW5231E-Z',
      address: 'г. Пермь, ул. Мира, 15',
      owner: 'Полиция',
      status: 'active',
      archiveDepth: 30,
    },
  ];

  const filteredCameras = cameras.filter(camera => {
    const query = searchQuery.toLowerCase();
    return (
      camera.name.toLowerCase().includes(query) ||
      camera.address.toLowerCase().includes(query) ||
      camera.owner.toLowerCase().includes(query)
    );
  });

  const filterGroups = (groups: OwnerGroup[]): OwnerGroup[] => {
    if (!groupSearchQuery.trim()) return groups;

    const query = groupSearchQuery.toLowerCase();
    const filtered: OwnerGroup[] = [];

    for (const group of groups) {
      const matches = group.name.toLowerCase().includes(query) || 
                      (group.description?.toLowerCase().includes(query) || false);
      const filteredChildren = group.children ? filterGroups(group.children) : [];

      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...group,
          children: filteredChildren.length > 0 ? filteredChildren : group.children,
        });
        if (filteredChildren.length > 0) {
          expandedGroups.add(group.id);
        }
      }
    }

    return filtered;
  };

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  const findGroupById = (groups: OwnerGroup[], id: string): OwnerGroup | null => {
    for (const group of groups) {
      if (group.id === id) return group;
      if (group.children) {
        const found = findGroupById(group.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addChildGroup = (groups: OwnerGroup[], parentId: string, newGroup: OwnerGroup) => {
    for (const group of groups) {
      if (group.id === parentId) {
        if (!group.children) group.children = [];
        group.children.push(newGroup);
        return true;
      }
      if (group.children && addChildGroup(group.children, parentId, newGroup)) {
        return true;
      }
    }
    return false;
  };

  const updateGroup = (groups: OwnerGroup[], id: string, updates: Partial<OwnerGroup>) => {
    for (const group of groups) {
      if (group.id === id) {
        Object.assign(group, updates);
        return true;
      }
      if (group.children && updateGroup(group.children, id, updates)) {
        return true;
      }
    }
    return false;
  };

  const deleteGroup = (groups: OwnerGroup[], id: string): boolean => {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].id === id) {
        groups.splice(i, 1);
        return true;
      }
      if (groups[i].children && deleteGroup(groups[i].children!, id)) {
        return true;
      }
    }
    return false;
  };

  const renderGroupTree = (group: OwnerGroup, level: number) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;

    return (
      <div key={group.id}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleGroup(group.id)}
              className="p-0.5 hover:bg-muted rounded"
            >
              <Icon
                name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                size={16}
                className="text-muted-foreground"
              />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <Icon name="Folder" size={16} className="text-primary" />
          <div className="flex-1">
            <p className="font-medium">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground">{group.description}</p>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewGroupParentId(group.id);
                setIsAddDialogOpen(true);
              }}
            >
              <Icon name="Plus" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingGroup(group);
                setIsEditDialogOpen(true);
              }}
            >
              <Icon name="Pencil" size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (hasChildren) {
                  toast.error('Нельзя удалить группу с подгруппами');
                  return;
                }
                deleteGroup(ownerGroups, group.id);
                setOwnerGroups([...ownerGroups]);
                toast.success('Группа удалена');
              }}
            >
              <Icon name="Trash2" size={14} className="text-destructive" />
            </Button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {group.children!.map(child => renderGroupTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleTestStream = () => {
    setTestingStream(true);
    setTimeout(() => {
      setTestingStream(false);
      toast.success('Видеопоток доступен');
    }, 2000);
  };

  return (
    <Tabs defaultValue="registry" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="registry">Камеры</TabsTrigger>
        <TabsTrigger value="groups">Собственники камер</TabsTrigger>
        <TabsTrigger value="tags">Теги</TabsTrigger>
        <TabsTrigger value="tag-groups">Группы тегов</TabsTrigger>
        <TabsTrigger value="models">Модели</TabsTrigger>
      </TabsList>

      <TabsContent value="registry">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Video" size={20} />
                Реестр камер видеонаблюдения
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative w-80">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по наименованию, улице, собственнику..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить камеру
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Новая камера видеонаблюдения</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[700px]">
                    <div className="space-y-4 py-4 pr-4">
                      <div className="space-y-2">
                        <Label>RTSP ссылка на видеопоток <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="rtsp://username:password@ip:port/stream"
                          className="font-mono text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Логин RTSP</Label>
                          <Input placeholder="admin" />
                        </div>
                        <div className="space-y-2">
                          <Label>Пароль RTSP</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleTestStream}
                          disabled={testingStream}
                        >
                          {testingStream ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Проверка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Проверить видеопоток
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Марка и модель камеры</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите модель" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hikvision-ds2cd">Hikvision DS-2CD2143G0-I</SelectItem>
                            <SelectItem value="dahua-ipc">Dahua IPC-HDBW4631R-ZS</SelectItem>
                            <SelectItem value="axis-p3375">Axis P3375-V</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>IP адрес PTZ</Label>
                          <Input placeholder="192.168.1.10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Порт PTZ</Label>
                          <Input placeholder="8000" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Логин PTZ</Label>
                          <Input placeholder="admin" />
                        </div>
                        <div className="space-y-2">
                          <Label>Пароль PTZ</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Собственник камеры <span className="text-red-500">*</span></Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите собственника" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mvd">МВД</SelectItem>
                            <SelectItem value="admin">Администрация</SelectItem>
                            <SelectItem value="gibdd">ГИБДД</SelectItem>
                            <SelectItem value="mchs">МЧС</SelectItem>
                            <SelectItem value="private">Частное лицо</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Глубина хранения видеоархива (дней) <span className="text-red-500">*</span></Label>
                        <Select defaultValue="30" required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 дней</SelectItem>
                            <SelectItem value="14">14 дней</SelectItem>
                            <SelectItem value="30">30 дней</SelectItem>
                            <SelectItem value="60">60 дней</SelectItem>
                            <SelectItem value="90">90 дней</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Территориальное деление <span className="text-red-500">*</span></Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите территорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Центральный район</SelectItem>
                            <SelectItem value="leninsky">Ленинский район</SelectItem>
                            <SelectItem value="dzer">Дзержинский район</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Адрес местоположения <span className="text-red-500">*</span></Label>
                        <Input placeholder="Определится автоматически по координатам" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Широта <span className="text-red-500">*</span></Label>
                          <Input placeholder="58.0105" type="number" step="any" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Долгота <span className="text-red-500">*</span></Label>
                          <Input placeholder="56.2502" type="number" step="any" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Карта местоположения</Label>
                        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Переместите маркер для указания местоположения
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Локальный IP адрес</Label>
                          <Input placeholder="192.168.1.10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Порт</Label>
                          <Input placeholder="554" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Описание</Label>
                        <Input placeholder="Краткое описание камеры" />
                      </div>

                      <div className="space-y-2">
                        <Label>Примечание</Label>
                        <Input placeholder="Дополнительная информация" />
                      </div>

                      <Button className="w-full" onClick={() => toast.success('Камера добавлена')}>
                        Сохранить камеру
                      </Button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredCameras.map((camera) => (
                  <Card key={camera.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Icon name="Video" size={24} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{camera.name}</h4>
                            <p className="text-sm text-muted-foreground">{camera.address}</p>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Модель</p>
                          <p className="font-medium">{camera.model}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Статус</p>
                          <Badge variant="secondary">Активна</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Архив</p>
                          <p className="font-medium">{camera.archiveDepth} дней</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">RTSP</p>
                          <p className="font-medium font-mono text-xs truncate">
                            {camera.rtspUrl.split('@')[1]}
                          </p>
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

      <TabsContent value="groups">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">Реестр собственников камер видеонаблюдения</span>
              <Button onClick={() => { setNewGroupParentId(null); setIsAddDialogOpen(true); }}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать группу
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию собственника..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {filterGroups(ownerGroups).map(group => renderGroupTree(group, 0))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать группу собственников</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newGroup: OwnerGroup = {
                id: Date.now().toString(),
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                parentId: newGroupParentId,
                children: [],
              };
              
              if (newGroupParentId) {
                addChildGroup(ownerGroups, newGroupParentId, newGroup);
                setOwnerGroups([...ownerGroups]);
              } else {
                setOwnerGroups([...ownerGroups, newGroup]);
              }
              
              setIsAddDialogOpen(false);
              toast.success('Группа создана');
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="МВД" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Input id="description" name="description" placeholder="Министерство внутренних дел" />
              </div>
              {newGroupParentId && (
                <p className="text-sm text-muted-foreground">
                  Будет создана как подгруппа: {findGroupById(ownerGroups, newGroupParentId)?.name}
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
                <Button type="submit">Создать</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать группу</DialogTitle>
            </DialogHeader>
            {editingGroup && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateGroup(ownerGroups, editingGroup.id, {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                });
                setOwnerGroups([...ownerGroups]);
                setIsEditDialogOpen(false);
                toast.success('Группа обновлена');
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Название <span className="text-red-500">*</span></Label>
                  <Input id="edit-name" name="name" defaultValue={editingGroup.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Описание</Label>
                  <Input id="edit-description" name="description" defaultValue={editingGroup.description} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
                  <Button type="submit">Сохранить</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="tags">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Tag" size={20} />
              Теги камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="Tag" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Добавляйте теги для быстрого поиска</p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать тег
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tag-groups">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Tags" size={20} />
              Группы тегов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icon name="Tags" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Объединяйте теги в группы</p>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать группу тегов
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="models">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings2" size={20} />
              Модели камер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Hikvision DS-2CD2143G0-I', 'Dahua IPC-HDBW4631R-ZS', 'Axis P3375-V'].map((model, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Video" size={20} className="text-muted-foreground" />
                        <span className="font-medium">{model}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CameraManagement;