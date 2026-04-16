import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Camera } from '@/lib/api';

interface CameraListProps {
  cameras: Camera[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  ownerFilter: string[];
  onOwnerFilterChange: (value: string[]) => void;
  groupFilter: string[];
  onGroupFilterChange: (value: string[]) => void;
  divisionFilter: string[];
  onDivisionFilterChange: (value: string[]) => void;
  tagFilter: string[];
  onTagFilterChange: (value: string[]) => void;
  analyticsFilter: string[];
  onAnalyticsFilterChange: (value: string[]) => void;
  showFilterSheet: boolean;
  onShowFilterSheetChange: (value: boolean) => void;
  activeFiltersCount: number;
  getStatusColor: (status: string) => string;
  onCameraClick: (camera: Camera) => void;
}

const CameraList = ({
  cameras,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  groupFilter,
  onGroupFilterChange,
  divisionFilter,
  onDivisionFilterChange,
  tagFilter,
  onTagFilterChange,
  analyticsFilter,
  onAnalyticsFilterChange,
  showFilterSheet,
  onShowFilterSheetChange,
  activeFiltersCount,
  getStatusColor,
  onCameraClick,
}: CameraListProps) => {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col h-full overflow-hidden">
      <Card className="h-full flex flex-col rounded-none border-t-0 border-l-0 border-b-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Icon name="List" size={20} />
            Реестр камер
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-3 border-b">
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по адресу или названию камеры..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Sheet open={showFilterSheet} onOpenChange={onShowFilterSheetChange}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Filter" size={16} />
                    Фильтры
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px]">
                <SheetHeader>
                  <SheetTitle>Фильтры камер</SheetTitle>
                  <SheetDescription>
                    Настройте параметры отображения камер
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>Статус камеры</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'active', label: 'Активные' },
                        { value: 'inactive', label: 'Неактивные' },
                        { value: 'problem', label: 'Проблемные' },
                      ]}
                      selected={statusFilter}
                      onChange={onStatusFilterChange}
                      placeholder="Выберите статус"
                      searchPlaceholder="Поиск статуса..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Собственник</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'МВД', label: 'МВД' },
                        { value: 'Администрация', label: 'Администрация' },
                      ]}
                      selected={ownerFilter}
                      onChange={onOwnerFilterChange}
                      placeholder="Выберите собственника"
                      searchPlaceholder="Поиск собственника..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Группа камер</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'Центральный район', label: 'Центральный район' },
                        { value: 'Дзержинский район', label: 'Дзержинский район' },
                        { value: 'Индустриальный район', label: 'Индустриальный район' },
                        { value: 'Ленинский район', label: 'Ленинский район' },
                        { value: 'Мотовилихинский район', label: 'Мотовилихинский район' },
                        { value: 'Свердловский район', label: 'Свердловский район' },
                        { value: 'Кировский район', label: 'Кировский район' },
                      ]}
                      selected={groupFilter}
                      onChange={onGroupFilterChange}
                      placeholder="Выберите группу"
                      searchPlaceholder="Поиск группы..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Территориальное деление</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'Центральный район', label: 'Центральный район' },
                        { value: 'Дзержинский район', label: 'Дзержинский район' },
                        { value: 'Индустриальный район', label: 'Индустриальный район' },
                        { value: 'Ленинский район', label: 'Ленинский район' },
                        { value: 'Мотовилихинский район', label: 'Мотовилихинский район' },
                        { value: 'Свердловский район', label: 'Свердловский район' },
                        { value: 'Кировский район', label: 'Кировский район' },
                      ]}
                      selected={divisionFilter}
                      onChange={onDivisionFilterChange}
                      placeholder="Выберите территорию"
                      searchPlaceholder="Поиск территории..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Теги</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'Важная', label: 'Важная' },
                        { value: 'Проблемная', label: 'Проблемная' },
                        { value: 'Новая', label: 'Новая' },
                        { value: 'На проверке', label: 'На проверке' },
                      ]}
                      selected={tagFilter}
                      onChange={onTagFilterChange}
                      placeholder="Выберите тег"
                      searchPlaceholder="Поиск тега..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Видеоаналитика</Label>
                    <MultiSelectCombobox
                      options={[
                        { value: 'face', label: 'Распознавание лиц' },
                        { value: 'grz', label: 'Распознавание ГРЗ' },
                      ]}
                      selected={analyticsFilter}
                      onChange={onAnalyticsFilterChange}
                      placeholder="Выберите тип аналитики"
                      searchPlaceholder="Поиск..."
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        onStatusFilterChange([]);
                        onOwnerFilterChange([]);
                        onGroupFilterChange([]);
                        onDivisionFilterChange([]);
                        onTagFilterChange([]);
                        onAnalyticsFilterChange([]);
                      }}
                    >
                      <Icon name="X" size={16} className="mr-2" />
                      Сбросить все фильтры
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <ScrollArea className="flex-1 h-full">
            <div className="p-4 space-y-3">
              {cameras.map((camera) => (
                <Card
                  key={camera.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onCameraClick(camera)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 ${getStatusColor(camera.status)} rounded-full`} />
                      <h4 className="font-medium">{camera.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {camera.address}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {cameras.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Камеры не найдены</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraList;
