import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const GUIDE_SECTIONS = [
  {
    title: 'Мониторинг',
    icon: 'Monitor',
    content: [
      { q: 'Как просмотреть видеопоток камеры?', a: 'Перейдите в раздел «Мониторинг», найдите камеру на карте или в списке слева и кликните на неё. Откроется окно с видеопотоком и информацией о камере.' },
      { q: 'Как включить/выключить кластеризацию камер на карте?', a: 'На странице мониторинга нажмите кнопку «Кластеризация» в правом нижнем углу карты.' },
      { q: 'Как фильтровать камеры?', a: 'Используйте панель фильтров слева: поиск по названию, фильтр по статусу, собственнику, группе, территориальному делению, тегам и аналитикам.' },
    ],
  },
  {
    title: 'Реестр камер',
    icon: 'Video',
    content: [
      { q: 'Как добавить новую камеру?', a: 'Перейдите в раздел «Параметры» → «Реестр камер» и нажмите кнопку «Добавить камеру». Заполните обязательные поля: название, RTSP-адрес, координаты.' },
      { q: 'Как редактировать камеру?', a: 'В реестре камер найдите нужную запись и нажмите иконку редактирования. Внесите изменения и сохраните.' },
      { q: 'Как удалить камеру?', a: 'В реестре камер нажмите иконку удаления напротив нужной камеры и подтвердите действие.' },
    ],
  },
  {
    title: 'Группы камер',
    icon: 'Layers',
    content: [
      { q: 'Как создать группу камер?', a: 'Перейдите в «Параметры» → «Группы камер» и нажмите «Создать группу». Укажите название, описание и добавьте камеры из списка.' },
      { q: 'Как добавить камеры в группу?', a: 'При создании или редактировании группы используйте список камер с поиском. Отмечайте нужные камеры галочками или нажмите «Выбрать все».' },
    ],
  },
  {
    title: 'ОРД — Поиск лиц и ГРЗ',
    icon: 'UserSearch',
    content: [
      { q: 'Как создать лист мониторинга лиц?', a: 'Перейдите в раздел «ОРД» → вкладка «Онлайн поиск лиц» и нажмите «Создать лист мониторинга». Загрузите фото и укажите e-mail для уведомлений.' },
      { q: 'Как выполнить исторический поиск лиц?', a: 'Перейдите в «ОРД» → «Исторический поиск лиц». Укажите период, выберите камеры для поиска, загрузите изображения и нажмите «Запустить».' },
      { q: 'Как найти автомобиль по ГРЗ?', a: 'Перейдите в «ОРД» → «Исторический поиск ГРЗ». Введите регистрационный знак (только кириллица и цифры), укажите период и камеры.' },
    ],
  },
  {
    title: 'Пользователи и роли',
    icon: 'Users',
    content: [
      { q: 'Как управлять пользователями?', a: 'Раздел «Администрирование» → «Пользователи». Здесь можно создавать, редактировать и удалять учётные записи, назначать роли и группы.' },
      { q: 'Как сменить пароль?', a: 'Нажмите на своё имя в правом верхнем углу и выберите «Сменить пароль». Введите текущий пароль и дважды новый.' },
      { q: 'Что делать если забыл пароль?', a: 'Обратитесь к системному администратору или в техническую поддержку по адресу support@esvs-perm.ru.' },
    ],
  },
  {
    title: 'Фотоархив',
    icon: 'Archive',
    content: [
      { q: 'Как создать задание на фотоархивирование?', a: 'Перейдите в раздел «Фотоархив» и нажмите «Создать задание». Укажите название, период, интервал съёмки и выберите камеры.' },
      { q: 'Как скачать архив?', a: 'В списке заданий найдите нужное и нажмите кнопку загрузки. Архив будет доступен в виде ZIP-файла.' },
    ],
  },
];

const Header = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [userRole, setUserRole] = useState<string>('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [guideSearch, setGuideSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const roleId = localStorage.getItem('userRoleId');
      if (!roleId) return;

      try {
        const response = await fetch('https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b');
        if (response.ok) {
          const roles = await response.json();
          const role = roles.find((r: { id: number; name: string }) => r.id === parseInt(roleId));
          if (role) {
            setUserRole(role.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

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
        setChangePasswordOpen(false);
        setPasswordForm({ current: '', next: '', confirm: '' });
      }
    } catch {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userLogin');
    toast.success('Вы вышли из системы');
    navigate('/login');
  };

  const handleUserGuide = () => {
    setUserGuideOpen(true);
  };

  const supportEmail = 'support@esvs-perm.ru';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    toast.success('Email скопирован в буфер обмена');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <>
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold leading-tight">
                  Единая система видеонаблюдения
                </h1>
                <p className="text-xs text-muted-foreground">Пермский край</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(currentTime)}</span>
              <span className="text-muted-foreground mx-2">•</span>
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="font-mono font-medium">{formatTime(currentTime)}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icon name="Bell" size={20} />
                  {notifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-yellow-600" />
                      <span className="font-medium">Проблемная камера</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Камера-003 на ул. Сибирская, 27 требует внимания
                    </p>
                    <span className="text-xs text-muted-foreground">5 минут назад</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-600" />
                      <span className="font-medium">Новая камера подключена</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Камера-245 успешно добавлена в систему
                    </p>
                    <span className="text-xs text-muted-foreground">1 час назад</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} className="text-blue-600" />
                      <span className="font-medium">Совпадение лица</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Обнаружено совпадение в листе мониторинга №12
                    </p>
                    <span className="text-xs text-muted-foreground">2 часа назад</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="User" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span>{userRole || 'Пользователь'}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {localStorage.getItem('userFullName') || localStorage.getItem('userLogin') || 'admin'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <Icon name="KeyRound" size={16} className="mr-2" />
                  Сменить пароль
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/changelog')}>
                  <Icon name="History" size={16} className="mr-2" />
                  История изменений
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUserGuide}>
                  <Icon name="FileText" size={16} className="mr-2" />
                  Руководство пользователя
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyEmail}>
                  <Icon name="Mail" size={16} className="mr-2" />
                  Техническая поддержка
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настройки
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <Dialog open={changePasswordOpen} onOpenChange={(open) => { setChangePasswordOpen(open); if (!open) setPasswordForm({ current: '', next: '', confirm: '' }); }}>
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
          <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Отмена</Button>
          <Button onClick={handleChangePassword} disabled={passwordLoading || !passwordForm.current || !passwordForm.next || !passwordForm.confirm}>
            {passwordLoading ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> : <Icon name="Check" size={16} className="mr-2" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={userGuideOpen} onOpenChange={(open) => { setUserGuideOpen(open); if (!open) setGuideSearch(''); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Руководство пользователя
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по инструкциям..."
            value={guideSearch}
            onChange={e => setGuideSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-2">
            {GUIDE_SECTIONS.map(section => {
              const filtered = section.content.filter(
                item =>
                  !guideSearch ||
                  item.q.toLowerCase().includes(guideSearch.toLowerCase()) ||
                  item.a.toLowerCase().includes(guideSearch.toLowerCase())
              );
              if (filtered.length === 0) return null;
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={section.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                  </div>
                  <div className="space-y-2 ml-6">
                    {filtered.map((item, i) => (
                      <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <p className="text-sm font-medium">{item.q}</p>
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {guideSearch && GUIDE_SECTIONS.every(s => s.content.every(
              item => !item.q.toLowerCase().includes(guideSearch.toLowerCase()) && !item.a.toLowerCase().includes(guideSearch.toLowerCase())
            )) && (
              <div className="text-center text-muted-foreground py-8">
                <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Ничего не найдено по запросу «{guideSearch}»</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Header;