import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface SettingsForm {
  notifyOnAlert: boolean;
  notifyOnOffline: boolean;
  notifySound: boolean;
  theme: 'light' | 'dark';
  compactTables: boolean;
  defaultPage: '/dashboard' | '/monitoring' | '/camera-registry';
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settingsForm: SettingsForm;
  setSettingsForm: React.Dispatch<React.SetStateAction<SettingsForm>>;
  onSave: () => void;
}

const PAGE_OPTIONS: { value: SettingsForm['defaultPage']; label: string }[] = [
  { value: '/dashboard', label: 'Дашборд' },
  { value: '/monitoring', label: 'Мониторинг' },
  { value: '/camera-registry', label: 'Реестр камер' },
];

const SettingsDialog = ({ open, onOpenChange, settingsForm, setSettingsForm, onSave }: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки портала
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">

          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Интерфейс</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Тёмная тема</p>
              <p className="text-xs text-muted-foreground">Переключить оформление портала</p>
            </div>
            <Switch
              checked={settingsForm.theme === 'dark'}
              onCheckedChange={v => setSettingsForm(f => ({ ...f, theme: v ? 'dark' : 'light' }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Компактный режим таблиц</p>
              <p className="text-xs text-muted-foreground">Уменьшить высоту строк в реестре камер</p>
            </div>
            <Switch
              checked={settingsForm.compactTables}
              onCheckedChange={v => setSettingsForm(f => ({ ...f, compactTables: v }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Страница после входа</p>
            <div className="flex gap-2">
              {PAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSettingsForm(f => ({ ...f, defaultPage: opt.value }))}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    settingsForm.defaultPage === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Уведомления</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Уведомления о тревогах</p>
              <p className="text-xs text-muted-foreground">Получать уведомления при срабатывании сигнализации</p>
            </div>
            <Switch checked={settingsForm.notifyOnAlert} onCheckedChange={v => setSettingsForm(f => ({ ...f, notifyOnAlert: v }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Уведомления об отключении камер</p>
              <p className="text-xs text-muted-foreground">Получать уведомления когда камера уходит офлайн</p>
            </div>
            <Switch checked={settingsForm.notifyOnOffline} onCheckedChange={v => setSettingsForm(f => ({ ...f, notifyOnOffline: v }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Звуковые уведомления</p>
              <p className="text-xs text-muted-foreground">Воспроизводить звук при получении уведомлений</p>
            </div>
            <Switch checked={settingsForm.notifySound} onCheckedChange={v => setSettingsForm(f => ({ ...f, notifySound: v }))} />
          </div>

        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={onSave}>
            <Icon name="Check" size={16} className="mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
