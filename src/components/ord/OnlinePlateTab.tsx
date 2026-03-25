import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { SearchResults } from '@/components/ord/SearchResults';

interface SearchResult {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera: string;
  address: string;
  image: string;
  plate?: string;
}

interface OnlinePlateTabProps {
  isCreatePlateFormOpen: boolean;
  setIsCreatePlateFormOpen: (v: boolean) => void;
  plateSearch: string;
  setPlateSearch: (v: string) => void;
  plateEmails: string[];
  setPlateEmails: (emails: string[]) => void;
  handlePlateSearch: () => void;
  mockResults: SearchResult[];
}

export const OnlinePlateTab = ({
  isCreatePlateFormOpen,
  setIsCreatePlateFormOpen,
  plateSearch,
  setPlateSearch,
  plateEmails,
  setPlateEmails,
  handlePlateSearch,
  mockResults,
}: OnlinePlateTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreatePlateFormOpen(!isCreatePlateFormOpen)}>
          <Icon name={isCreatePlateFormOpen ? "ChevronUp" : "Plus"} size={16} className="mr-2" />
          {isCreatePlateFormOpen ? "Скрыть форму" : "Создать лист мониторинга ГРЗ"}
        </Button>
      </div>

      {isCreatePlateFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Создать лист мониторинга ГРЗ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate-name">Наименование <span className="text-destructive">*</span></Label>
              <Input id="plate-name" placeholder="Введите название листа мониторинга" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate-description">Описание</Label>
              <Input id="plate-description" placeholder="Описание листа мониторинга" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate-search">Государственный регистрационный знак <span className="text-destructive">*</span></Label>
              <Input
                id="plate-search"
                placeholder="Например: А123ВС159"
                value={plateSearch}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  const filtered = value.replace(/[^АВЕКМНОРСТУХ0-9]/g, '');
                  setPlateSearch(filtered);
                }}
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Уведомления на e-mail</Label>
              <div className="space-y-2">
                {plateEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="example@mail.ru"
                      value={email}
                      onChange={(e) => {
                        const updated = [...plateEmails];
                        updated[idx] = e.target.value;
                        setPlateEmails(updated);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPlateEmails(plateEmails.filter((_, i) => i !== idx))}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlateEmails([...plateEmails, ''])}
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Добавить e-mail
                </Button>
              </div>
            </div>

            <Button onClick={handlePlateSearch} className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Создать лист мониторинга
            </Button>
          </CardContent>
        </Card>
      )}

      <SearchResults results={mockResults.filter((r) => r.type === 'plate')} />
    </div>
  );
};
