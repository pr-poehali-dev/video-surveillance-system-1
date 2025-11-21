import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { path: '/dashboard', label: 'Главная', icon: 'Home' },
    { path: '/monitoring', label: 'Мониторинг', icon: 'Map' },
    { path: '/ord', label: 'ОРД', icon: 'Search' },
    { path: '/layouts', label: 'Раскладки', icon: 'Grid3x3' },
    { path: '/reports', label: 'Отчеты', icon: 'BarChart3' },
    { path: '/settings', label: 'Настройки', icon: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                <Icon name="Video" className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
                  Единая система видеонаблюдения
                </h1>
                <p className="text-xs text-muted-foreground">Пермский край</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.slice(0, 4).map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  <Icon name={item.icon as any} size={16} />
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                {currentTime.toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
                {' '}
                <span className="font-mono font-semibold text-foreground">
                  {currentTime.toLocaleTimeString('ru-RU')}
                </span>
              </div>

              <Button variant="ghost" size="icon">
                <Icon name="Bell" size={20} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Icon name="User" size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/reports')}>
                    <Icon name="BarChart3" size={16} className="mr-2" />
                    Отчеты
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Руководство пользователя
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Icon name="Mail" size={16} className="mr-2" />
                    support@esvs.perm.ru
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Icon name="Menu" size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Навигация</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                      <Icon name={item.icon as any} size={16} className="mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
