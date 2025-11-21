import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface LayoutConfig {
  id: number;
  name: string;
  grid: number;
  cameras: number[];
}

const Layouts = () => {
  const [layouts, setLayouts] = useState<LayoutConfig[]>([
    { id: 1, name: 'Главные камеры', grid: 4, cameras: [1, 2, 3, 4] },
    { id: 2, name: 'Центр города', grid: 9, cameras: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutConfig | null>(layouts[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutGrid, setNewLayoutGrid] = useState('4');

  const gridOptions = [
    { value: '1', label: '1 камера', cols: 1, rows: 1 },
    { value: '2', label: '2 камеры', cols: 2, rows: 1 },
    { value: '4', label: '4 камеры', cols: 2, rows: 2 },
    { value: '6', label: '6 камер', cols: 3, rows: 2 },
    { value: '9', label: '9 камер', cols: 3, rows: 3 },
    { value: '12', label: '12 камер', cols: 4, rows: 3 },
  ];

  const cameras = [
    { id: 1, name: 'Камера-001', address: 'ул. Ленина, 50', status: 'active' },
    { id: 2, name: 'Камера-002', address: 'ул. Монастырская, 12', status: 'active' },
    { id: 3, name: 'Камера-003', address: 'ул. Сибирская, 27', status: 'problem' },
    { id: 4, name: 'Камера-004', address: 'Комсомольский пр., 68', status: 'active' },
    { id: 5, name: 'Камера-005', address: 'ул. Петропавловская, 35', status: 'inactive' },
    { id: 6, name: 'Камера-006', address: 'ул. Куйбышева, 95', status: 'active' },
    { id: 7, name: 'Камера-007', address: 'ул. Пушкина, 15', status: 'active' },
    { id: 8, name: 'Камера-008', address: 'ул. Крупской, 82', status: 'active' },
    { id: 9, name: 'Камера-009', address: 'ул. Борчанинова, 23', status: 'active' },
  ];

  const handleCreateLayout = () => {
    if (!newLayoutName) {
      toast.error('Введите название раскладки');
      return;
    }

    const newLayout: LayoutConfig = {
      id: layouts.length + 1,
      name: newLayoutName,
      grid: parseInt(newLayoutGrid),
      cameras: Array.from({ length: parseInt(newLayoutGrid) }, (_, i) => i + 1),
    };

    setLayouts([...layouts, newLayout]);
    setSelectedLayout(newLayout);
    setIsCreateDialogOpen(false);
    setNewLayoutName('');
    toast.success('Раскладка создана');
  };

  const getGridConfig = (grid: number) => {
    const config = gridOptions.find((opt) => opt.value === grid.toString());
    return config || gridOptions[2];
  };

  const currentGrid = selectedLayout ? getGridConfig(selectedLayout.grid) : gridOptions[2];

  return (
    <div className="bg-background">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Раскладки</h1>
            <p className="text-sm text-muted-foreground">
              Одновременный просмотр камер
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать раскладку
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая раскладка</DialogTitle>
                  <DialogDescription>
                    Создайте новую раскладку для одновременного просмотра камер
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="layout-name">Название раскладки</Label>
                    <Input
                      id="layout-name"
                      placeholder="Введите название"
                      value={newLayoutName}
                      onChange={(e) => setNewLayoutName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="layout-grid">Количество камер</Label>
                    <Select value={newLayoutGrid} onValueChange={setNewLayoutGrid}>
                      <SelectTrigger id="layout-grid">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gridOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateLayout} className="w-full">
                  Создать
                </Button>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">Мои раскладки</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {layouts.map((layout) => (
                  <Card
                    key={layout.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLayout?.id === layout.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedLayout(layout)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{layout.name}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLayouts(layouts.filter((l) => l.id !== layout.id));
                            if (selectedLayout?.id === layout.id) {
                              setSelectedLayout(layouts[0] || null);
                            }
                            toast.success('Раскладка удалена');
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Icon name="Grid3x3" size={12} className="mr-1" />
                        {layout.grid} камер
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        <main className="flex-1 p-6 bg-muted/20">
          {selectedLayout ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLayout.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Сетка {currentGrid.cols}×{currentGrid.rows}
                  </p>
                </div>
                <Button variant="outline">
                  <Icon name="Settings" size={18} className="mr-2" />
                  Настроить камеры
                </Button>
              </div>

              <div
                className="grid gap-4 h-[calc(100%-80px)]"
                style={{
                  gridTemplateColumns: `repeat(${currentGrid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${currentGrid.rows}, 1fr)`,
                }}
              >
                {Array.from({ length: selectedLayout.grid }).map((_, index) => {
                  const camera = cameras[index % cameras.length];
                  return (
                    <Card
                      key={index}
                      className="border-border/50 overflow-hidden group hover:shadow-xl transition-all"
                    >
                      <div className="h-full flex flex-col">
                        <div className="flex-1 bg-muted relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Icon
                                name="Video"
                                size={48}
                                className="text-muted-foreground mx-auto mb-2 opacity-50"
                              />
                              <p className="text-sm text-muted-foreground">
                                {camera.name}
                              </p>
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                              <Icon name="Maximize2" size={14} />
                            </Button>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                              <Icon name="Volume2" size={14} />
                            </Button>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <div className="flex items-center justify-between text-white text-xs">
                              <div>
                                <p className="font-medium">{camera.name}</p>
                                <p className="text-white/80 text-xs">{camera.address}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>LIVE</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icon name="Grid3x3" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет выбранной раскладки</h3>
                <p className="text-muted-foreground mb-4">
                  Выберите раскладку или создайте новую
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать раскладку
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layouts;