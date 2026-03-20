import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'new' | 'fix' | 'improvement';
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '20.03.2026',
    changes: [
      { type: 'new', text: 'Добавлена страница "История изменений"' },
      { type: 'new', text: 'Добавлен поиск в выпадающих списках формы пользователя (группа, роль, группа камер)' },
      { type: 'fix', text: 'Исправлено отображение времени сессий с учётом локального часового пояса' },
      { type: 'fix', text: 'Обновлён email технической поддержки' },
    ],
  },
  {
    version: '1.2.0',
    date: '15.03.2026',
    changes: [
      { type: 'new', text: 'Добавлен модуль управления пользователями и ролями' },
      { type: 'new', text: 'Добавлена вкладка "Сессии" в разделе доступа' },
      { type: 'improvement', text: 'Улучшен интерфейс раздела "Параметры"' },
    ],
  },
  {
    version: '1.1.0',
    date: '01.03.2026',
    changes: [
      { type: 'new', text: 'Добавлен раздел "Реестр камер"' },
      { type: 'new', text: 'Добавлен фотоархив' },
      { type: 'improvement', text: 'Оптимизирована страница мониторинга' },
      { type: 'fix', text: 'Исправлены ошибки авторизации' },
    ],
  },
  {
    version: '1.0.0',
    date: '15.02.2026',
    changes: [
      { type: 'new', text: 'Первый релиз системы' },
      { type: 'new', text: 'Дашборд с основными показателями' },
      { type: 'new', text: 'Модуль мониторинга' },
      { type: 'new', text: 'Авторизация и управление сессиями' },
    ],
  },
];

const typeConfig = {
  new: { label: 'Новое', variant: 'default' as const, icon: 'Plus' },
  fix: { label: 'Исправление', variant: 'destructive' as const, icon: 'Wrench' },
  improvement: { label: 'Улучшение', variant: 'secondary' as const, icon: 'ArrowUp' },
};

const Changelog = () => {
  return (
    <div className="container mx-auto max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-3">
        <Icon name="History" size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">История изменений</h1>
          <p className="text-sm text-muted-foreground">Журнал обновлений системы</p>
        </div>
      </div>

      <div className="space-y-4">
        {changelog.map((entry, index) => (
          <Card key={entry.version}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Tag" size={18} className="text-primary" />
                  Версия {entry.version}
                  {index === 0 && (
                    <Badge variant="default" className="ml-1 text-xs">Текущая</Badge>
                  )}
                </CardTitle>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  {entry.date}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entry.changes.map((change, i) => {
                  const config = typeConfig[change.type];
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant={config.variant} className="mt-0.5 shrink-0 text-xs">
                        {config.label}
                      </Badge>
                      <span className="text-sm">{change.text}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Changelog;
