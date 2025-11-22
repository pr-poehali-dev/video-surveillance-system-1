import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditLogTabProps {
  auditLog: any[];
}

const AuditLogTab = ({ auditLog }: AuditLogTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="ScrollText" size={20} />
            Журнал действий
          </CardTitle>
          <Button variant="outline">
            <Icon name="Download" size={18} className="mr-2" />
            Экспорт
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {auditLog.map((log) => (
              <Card key={log.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{log.user}</Badge>
                          <span className="text-sm font-semibold">{log.action}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            {log.timestamp.toLocaleString('ru-RU')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Globe" size={12} />
                            {log.ip}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditLogTab;
