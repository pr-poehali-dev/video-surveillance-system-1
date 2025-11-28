import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const Navigation = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Главная', icon: 'Home' },
    { path: '/monitoring', label: 'Мониторинг', icon: 'Map' },
    { path: '/ord', label: 'ОРД', icon: 'Search' },
    { path: '/layouts', label: 'Раскладки', icon: 'Grid3x3' },
    { path: '/reports', label: 'Отчеты', icon: 'BarChart3' },
    { path: '/photo-archive', label: 'Фотоархив', icon: 'Image' },
    { path: '/parameters', label: 'Параметры', icon: 'Settings' },
    { path: '/viss', label: 'ВиВС', icon: 'Network' },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon name={item.icon as any} size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;