import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface UserCardProps {
  user: any;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const handleImpersonate = () => {
    // Создаём HTML-страницу с автоматической отправкой формы
    const impersonateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Вход в систему...</title>
      </head>
      <body>
        <form id="loginForm" action="/login" method="POST">
          <input type="hidden" name="login" value="${user.login}" />
          <input type="hidden" name="password" value="${user.password}" />
        </form>
        <script>
          document.getElementById('loginForm').submit();
        </script>
      </body>
      </html>
    `;
    
    // Открываем новую вкладку и записываем туда HTML
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(impersonateHTML);
      newWindow.document.close();
      toast.success(`Открыта новая вкладка для входа как ${user.fio}`);
    } else {
      toast.error('Не удалось открыть новую вкладку. Разрешите всплывающие окна.');
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
              <h3 className="font-medium">{user.fio}</h3>
              <p className="text-sm text-muted-foreground">{user.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user.isOnline && (
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
            <Badge variant="outline">{user.role}</Badge>
          </div>
          {user.workPhone && (
            <div>
              <p className="text-muted-foreground text-xs">Рабочий телефон</p>
              <p className="font-medium">{user.workPhone}</p>
            </div>
          )}
          {user.mobilePhone && (
            <div>
              <p className="text-muted-foreground text-xs">Сотовый телефон</p>
              <p className="font-medium">{user.mobilePhone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;