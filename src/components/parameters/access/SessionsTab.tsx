import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface SessionsTabProps {
  sessions: any[];
}

const SessionsTab = ({ sessions }: SessionsTabProps) => {
  return (
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
  );
};

export default SessionsTab;
