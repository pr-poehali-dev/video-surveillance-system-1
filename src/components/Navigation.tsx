import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { usePermissions } from '@/hooks/usePermissions';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission?: keyof ReturnType<typeof usePermissions>['permissions'];
}

const Navigation = () => {
  const location = useLocation();
  const { permissions, loading } = usePermissions();

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Главная', icon: 'Home' },
    { path: '/monitoring', label: 'Мониторинг', icon: 'Map', permission: 'monitoring' },
    { path: '/ord', label: 'ОРД', icon: 'Search', permission: 'ord' },
    { path: '/layouts', label: 'Раскладки', icon: 'Grid3x3', permission: 'layouts' },
    { path: '/photo-archive', label: 'Фотоархив', icon: 'Image', permission: 'photoArchive' },
    { path: '/reports', label: 'Отчеты', icon: 'BarChart3', permission: 'reports' },
    { path: '/parameters', label: 'Параметры', icon: 'Settings', permission: 'parameters' },
    { path: '/viss', label: 'ВиВС', icon: 'Network', permission: 'viss' },
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission] === true;
  });

  if (loading) {
    return (
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 h-[52px]" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {visibleItems.map((item) => {
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