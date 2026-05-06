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
import { toast } from 'sonner';

interface SettingsForm {
  notifyOnAlert: boolean;
  notifyOnOffline: boolean;
  notifySound: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settingsForm: SettingsForm;
  setSettingsForm: React.Dispatch<React.SetStateAction<SettingsForm>>;
  onSave: () => void;
}

const SettingsDialog = ({ open, onOpenChange, settingsForm, setSettingsForm, onSave }: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки портала
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
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
