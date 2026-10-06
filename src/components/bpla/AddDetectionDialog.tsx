import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';
import { DRONE_TYPES } from './types';

interface AddDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const emptyForm = {
  type: 'FPV дрон',
  lat: '',
  lng: '',
  zone: '',
  threat: 'medium',
  status: 'active',
  altitude: '',
  speed: '',
  camera: '',
  address: '',
  photo_url: '',
};

const AddDetectionDialog = ({ open, onOpenChange, onSaved }: AddDetectionDialogProps) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(form.lat.replace(',', '.'));
    const lng = parseFloat(form.lng.replace(',', '.'));
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Укажите координаты числами');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${CAMERAS_SERVICE_API}?resource=drone-detections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          lat,
          lng,
          zone: form.zone || null,
          threat: form.threat,
          status: form.status,
          altitude: form.altitude ? parseInt(form.altitude) : null,
          speed: form.speed ? parseInt(form.speed) : null,
          camera: form.camera || null,
          address: form.address || null,
          photo_url: form.photo_url || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Не удалось сохранить запись');
        return;
      }
      toast.success('Обнаружение добавлено');
      setForm(emptyForm);
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plane" size={20} />
            Новое обнаружение БПЛА
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип БПЛА *</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DRONE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Сектор</Label>
              <Input placeholder="Сектор А-1" value={form.zone} onChange={(e) => set('zone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Широта *</Label>
              <Input placeholder="58.0105" value={form.lat} onChange={(e) => set('lat', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Долгота *</Label>
              <Input placeholder="56.2502" value={form.lng} onChange={(e) => set('lng', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Уровень угрозы</Label>
              <Select value={form.threat} onValueChange={(v) => set('threat', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Высокая</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="low">Низкая</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="neutralized">Нейтрализован</SelectItem>
                  <SelectItem value="lost">Потерян</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Высота (м)</Label>
              <Input type="number" min="0" placeholder="120" value={form.altitude} onChange={(e) => set('altitude', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Скорость (км/ч)</Label>
              <Input type="number" min="0" placeholder="60" value={form.speed} onChange={(e) => set('speed', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Камера</Label>
              <Input placeholder="Название камеры" value={form.camera} onChange={(e) => set('camera', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input placeholder="г. Пермь, ул. Ленина, 10" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ссылка на фото</Label>
            <Input placeholder="https://..." value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Сохраняю...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDetectionDialog;
