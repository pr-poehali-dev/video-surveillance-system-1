import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id: number;
  full_name: string;
  email: string;
  login: string;
  company?: string;
  role_name?: string;
  work_phone?: string;
  mobile_phone?: string;
  is_online: boolean;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const handleImpersonate = () => {
    const impersonateData = {
      login: user.login,
      timestamp: Date.now()
    };
    
    const impersonateKey = `impersonate_${Date.now()}`;
    sessionStorage.setItem(impersonateKey, JSON.stringify(impersonateData));
    
    const newWindow = window.open(`/login?impersonate=${impersonateKey}`, '_blank');
    
    if (newWindow) {
      toast.success(`Открыта новая вкладка для входа как ${user.full_name}`);
    } else {
      toast.error('Не удалось открыть новую вкладку. Разрешите всплывающие окна.');
      sessionStorage.removeItem(impersonateKey);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{user.full_name}</h3>
              {user.company && (
                <p className="text-sm text-muted-foreground">{user.company}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user.is_online && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Онлайн
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleImpersonate}
              title="Войти как этот пользователь"
            >
              <Icon name="LogIn" size={14} className="mr-2" />
              Войти
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(user)}
            >
              <Icon name="Pencil" size={14} className="mr-2" />
              Изменить
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(user)}
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
            <Badge variant="outline">{user.role_name || 'Не назначена'}</Badge>
          </div>
          {user.work_phone && (
            <div>
              <p className="text-muted-foreground text-xs">Рабочий телефон</p>
              <p className="font-medium">{user.work_phone}</p>
            </div>
          )}
          {user.mobile_phone && (
            <div>
              <p className="text-muted-foreground text-xs">Сотовый телефон</p>
              <p className="font-medium">{user.mobile_phone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
