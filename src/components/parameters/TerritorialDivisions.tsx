import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TerritorialDivisions = () => {
  const divisions = [
    { id: 1, name: 'Центральный район', cameras: 245, color: 'bg-blue-500' },
    { id: 2, name: 'Ленинский район', cameras: 312, color: 'bg-green-500' },
    { id: 3, name: 'Дзержинский район', cameras: 198, color: 'bg-orange-500' },
    { id: 4, name: 'Свердловский район', cameras: 267, color: 'bg-purple-500' },
    { id: 5, name: 'Мотовилихинский район', cameras: 225, color: 'bg-red-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="MapPinned" size={20} />
            Территориальные деления
          </CardTitle>
          <Button>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить территорию
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {divisions.map((division) => (
            <Card key={division.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${division.color} rounded-full flex items-center justify-center`}>
                      <Icon name="MapPin" size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{division.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Камер: {division.cameras}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" size={14} className="mr-1" />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Edit" size={14} className="mr-1" />
                      Изменить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TerritorialDivisions;
