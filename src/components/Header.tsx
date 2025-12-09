import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [userRole, setUserRole] = useState<string>('');

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
          const role = roles.find((r: any) => r.id === parseInt(roleId));
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userLogin');
    toast.success('Вы вышли из системы');
    navigate('/login');
  };

  const handleUserGuide = () => {
    navigate('/user-guide');
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
  );
};

export default Header;