import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { LayoutConfig, CameraItem, GridOption } from './types';

interface LayoutSettingsDialogProps {
  layout: LayoutConfig | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (updated: LayoutConfig) => void;
  allCameras: CameraItem[];
  gridOptions: GridOption[];
}

export const LayoutSettingsDialog = ({ layout, open, onOpenChange, onSave, allCameras, gridOptions }: LayoutSettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<'cameras' | 'grid' | 'options'>('cameras');
  const [draft, setDraft] = useState<LayoutConfig | null>(null);
  const [cameraSearch, setCameraSearch] = useState('');

  useEffect(() => {
    if (layout) setDraft({ ...layout });
  }, [layout]);

  if (!draft) return null;

  const maxCameras = draft.grid;

  const toggleCamera = (id: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const has = prev.cameras.includes(id);
      if (has) return { ...prev, cameras: prev.cameras.filter((c) => c !== id) };
      if (prev.cameras.length >= maxCameras) return prev;
      return { ...prev, cameras: [...prev.cameras, id] };
    });
  };

  const moveCameraUp = (idx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const cams = [...prev.cameras];
      if (idx === 0) return prev;
      [cams[idx - 1], cams[idx]] = [cams[idx], cams[idx - 1]];
      return { ...prev, cameras: cams };
    });
  };

  const moveCameraDown = (idx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const cams = [...prev.cameras];
      if (idx === cams.length - 1) return prev;
      [cams[idx], cams[idx + 1]] = [cams[idx + 1], cams[idx]];
      return { ...prev, cameras: cams };
    });
  };

  const removeCamera = (id: number) => {
    setDraft((prev) => prev ? { ...prev, cameras: prev.cameras.filter((c) => c !== id) } : prev);
  };

  const changeGrid = (value: string) => {
    const newGrid = parseInt(value);
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, grid: newGrid, cameras: prev.cameras.slice(0, newGrid) };
    });
  };

  const filteredAvail = allCameras.filter(
    (c) =>
      !draft.cameras.includes(c.id) &&
      (c.name.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        c.address.toLowerCase().includes(cameraSearch.toLowerCase())),
  );

  const statusColor: Record<string, string> = {
    active: 'text-green-500',
    problem: 'text-yellow-500',
    inactive: 'text-red-500',
  };
  const statusLabel: Record<string, string> = {
    active: 'Активна',
    problem: 'Проблема',
    inactive: 'Неактивна',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={18} />
            Настройки раскладки: {draft.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b pb-2 mb-4">
          {([
            { key: 'cameras', label: 'Камеры', icon: 'Camera' },
            { key: 'grid', label: 'Сетка', icon: 'Grid3x3' },
            { key: 'options', label: 'Параметры', icon: 'SlidersHorizontal' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'cameras' && (
            <div className="flex gap-4 h-[380px]">
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  В раскладке ({draft.cameras.length}/{maxCameras})
                </p>
                <ScrollArea className="flex-1 border rounded-md">
                  {draft.cameras.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">Нет камер</div>
                  ) : (
                    <div className="divide-y">
                      {draft.cameras.map((cid, idx) => {
                        const cam = allCameras.find((c) => c.id === cid);
                        if (!cam) return null;
                        return (
                          <div key={cid} className="flex items-center gap-2 px-3 py-2">
                            <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{cam.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{cam.address}</div>
                            </div>
                            <div className="flex gap-0.5">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCameraUp(idx)}>
                                <Icon name="ChevronUp" size={12} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCameraDown(idx)}>
                                <Icon name="ChevronDown" size={12} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCamera(cid)}>
                                <Icon name="X" size={12} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="flex-1 flex flex-col">
                <p className="text-xs font-medium text-muted-foreground mb-2">Доступные камеры</p>
                <div className="relative mb-2">
                  <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={cameraSearch}
                    onChange={(e) => setCameraSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <ScrollArea className="flex-1 border rounded-md">
                  <div className="divide-y">
                    {filteredAvail.map((cam) => (
                      <button
                        key={cam.id}
                        onClick={() => toggleCamera(cam.id)}
                        disabled={draft.cameras.length >= maxCameras}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left transition-colors disabled:opacity-40"
                      >
                        <Icon name="Plus" size={14} className="text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cam.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{cam.address}</div>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${statusColor[cam.status]}`}>
                          {statusLabel[cam.status]}
                        </span>
                      </button>
                    ))}
                    {filteredAvail.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground text-center">Нет камер</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {activeTab === 'grid' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Количество ячеек</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gridOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => changeGrid(opt.value)}
                      className={`border rounded-lg p-3 text-center transition-colors ${
                        String(draft.grid) === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div
                        className="grid gap-0.5 mx-auto mb-1"
                        style={{
                          gridTemplateColumns: `repeat(${opt.cols}, 1fr)`,
                          width: opt.cols * 14,
                        }}
                      >
                        {Array.from({ length: parseInt(opt.value) }).map((_, i) => (
                          <div key={i} className="h-3 rounded-sm bg-current opacity-40" />
                        ))}
                      </div>
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {draft.cameras.length > draft.grid && (
                <p className="text-sm text-yellow-600">
                  При уменьшении сетки последние {draft.cameras.length - draft.grid} камер будут убраны
                </p>
              )}
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Отображение камер</Label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!draft.hideInactive}
                    onCheckedChange={(v) => setDraft((p) => p ? { ...p, hideInactive: !!v } : p)}
                  />
                  <div>
                    <div className="text-sm">Скрывать неактивные камеры</div>
                    <div className="text-xs text-muted-foreground">Камеры со статусом «Неактивна» не отображаются</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!draft.hideProblem}
                    onCheckedChange={(v) => setDraft((p) => p ? { ...p, hideProblem: !!v } : p)}
                  />
                  <div>
                    <div className="text-sm">Скрывать камеры с проблемами</div>
                    <div className="text-xs text-muted-foreground">Камеры со статусом «Проблема» не отображаются</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={draft.showLabels !== false}
                    onCheckedChange={(v) => setDraft((p) => p ? { ...p, showLabels: !!v } : p)}
                  />
                  <div>
                    <div className="text-sm">Показывать подписи камер</div>
                    <div className="text-xs text-muted-foreground">Название и адрес камеры под видео</div>
                  </div>
                </label>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Автоматическое переключение</Label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!draft.autoRotate}
                    onCheckedChange={(v) => setDraft((p) => p ? { ...p, autoRotate: !!v } : p)}
                  />
                  <div>
                    <div className="text-sm">Авторотация раскладок</div>
                    <div className="text-xs text-muted-foreground">Автоматически переключать раскладки по таймеру</div>
                  </div>
                </label>
                {draft.autoRotate && (
                  <div className="ml-8 space-y-1">
                    <Label className="text-xs">Интервал (секунды)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={300}
                      value={draft.rotateInterval ?? 30}
                      onChange={(e) => setDraft((p) => p ? { ...p, rotateInterval: parseInt(e.target.value) || 30 } : p)}
                      className="w-32 h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={() => { onSave(draft); onOpenChange(false); toast.success('Настройки сохранены'); }}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
