import { useState, useEffect, useRef } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { LayoutConfig, GRID_OPTIONS, CAMERAS_LIST } from './layouts/types';
import { LayoutSidebar } from './layouts/LayoutSidebar';
import { LayoutViewer } from './layouts/LayoutViewer';
import { LayoutShareDialog } from './layouts/LayoutShareDialog';
import { LayoutSettingsDialog } from './layouts/LayoutSettingsDialog';

const Layouts = () => {
  const [layouts, setLayouts] = useState<LayoutConfig[]>([
    { id: 1, name: 'Главные камеры', grid: 4, cameras: [1, 2, 3, 4] },
    { id: 2, name: 'Центр города', grid: 9, cameras: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  ]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutConfig | null>(layouts[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<LayoutConfig | null>(null);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutGrid, setNewLayoutGrid] = useState('4');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [layoutToShare, setLayoutToShare] = useState<LayoutConfig | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

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

  const handleFullscreen = () => {
    if (!layoutContainerRef.current) return;
    if (!isFullscreen) {
      layoutContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="bg-background">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
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
                    <Label htmlFor="layout-name">Название раскладки <span className="text-destructive">*</span></Label>
                    <Input
                      id="layout-name"
                      placeholder="Введите название"
                      value={newLayoutName}
                      onChange={(e) => setNewLayoutName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="layout-grid">Количество камер</Label>
                    <Select value={newLayoutGrid} onValueChange={setNewLayoutGrid}>
                      <SelectTrigger id="layout-grid">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRID_OPTIONS.map((option) => (
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
        <LayoutSidebar
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelect={setSelectedLayout}
          onShare={(layout) => {
            setLayoutToShare(layout);
            setIsShareDialogOpen(true);
          }}
          onDelete={(layout) => {
            setLayoutToDelete(layout);
            setIsDeleteDialogOpen(true);
          }}
        />

        <LayoutViewer
          selectedLayout={selectedLayout}
          cameras={CAMERAS_LIST}
          gridOptions={GRID_OPTIONS}
          isFullscreen={isFullscreen}
          onFullscreen={handleFullscreen}
          onOpenSettings={() => setIsSettingsDialogOpen(true)}
          onCreateLayout={() => setIsCreateDialogOpen(true)}
          layoutContainerRef={layoutContainerRef}
        />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить раскладку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить раскладку "{layoutToDelete?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (layoutToDelete) {
                  setLayouts(layouts.filter((l) => l.id !== layoutToDelete.id));
                  if (selectedLayout?.id === layoutToDelete.id) {
                    setSelectedLayout(layouts[0] || null);
                  }
                  toast.success('Раскладка удалена');
                  setLayoutToDelete(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LayoutShareDialog
        layout={layoutToShare}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />

      <LayoutSettingsDialog
        layout={selectedLayout}
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        allCameras={CAMERAS_LIST}
        gridOptions={GRID_OPTIONS}
        onSave={(updated) => {
          setLayouts((prev) => prev.map((l) => l.id === updated.id ? updated : l));
          setSelectedLayout(updated);
        }}
      />
    </div>
  );
};

export default Layouts;
