import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Session {
  id: number;
  user_id: number;
  full_name: string;
  login: string;
  ip_address: string;
  current_route: string;
  last_activity: string;
  session_token: string;
}

const SESSIONS_API = 'https://functions.poehali.dev/16e39082-42c6-4aa9-9d08-b1ba9520eb50';

const SessionsTab = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(SESSIONS_API);
      console.log('SessionsTab: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('SessionsTab: All sessions from API:', data);
        
        const now = new Date().getTime();
        const activeSessions = data.filter((session: Session) => {
          const lastActivity = new Date(session.last_activity).getTime();
          const timeDiff = (now - lastActivity) / 1000 / 60;
          console.log(`SessionsTab: ${session.full_name} - last_activity: ${session.last_activity}, diff: ${timeDiff.toFixed(2)} min`);
          return timeDiff <= 10;
        });
        
        console.log('SessionsTab: Active sessions (<=10 min):', activeSessions);
        setSessions(activeSessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionToken: string) => {
    try {
      const response = await fetch(`${SESSIONS_API}?session_token=${encodeURIComponent(sessionToken)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Сеанс завершен');
        fetchSessions();
      } else {
        toast.error('Ошибка при завершении сеанса');
      }
    } catch (error) {
      toast.error('Ошибка при завершении сеанса');
    }
  };

  const getRouteName = (route: string) => {
    const routes: Record<string, string> = {
      '/dashboard': 'Главная',
      '/monitoring': 'Мониторинг',
      '/cameras': 'Камеры',
      '/ord': 'ОРД',
      '/photoarchive': 'Фотоархив',
      '/reports': 'Отчеты',
      '/parameters': 'Параметры',
    };
    return routes[route] || route;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" size={20} />
          Активные сеансы
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Нет активных сеансов</p>
          </div>
        ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{session.full_name}</h4>
                        <span className="text-xs text-muted-foreground">({session.login})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Globe" size={12} />
                          {session.ip_address || 'Неизвестно'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="FileText" size={12} />
                          {getRouteName(session.current_route)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {new Date(session.last_activity).toLocaleTimeString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEndSession(session.session_token)}>
                    <Icon name="LogOut" size={14} className="mr-1" />
                    Завершить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionsTab;