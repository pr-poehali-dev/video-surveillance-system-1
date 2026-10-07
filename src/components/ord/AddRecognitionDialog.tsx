import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { ORD_API } from './ordApi';
import { CameraOption } from './CameraMultiSelect';

interface AddRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameras: CameraOption[];
  onSaved: () => void;
}

const emptyForm = {
  kind: 'face',
  camera_id: '',
  plate: '',
  match: '',
  recognized_at: '',
  image_url: '',
  car_image_url: '',
  video_url: '',
};

const AddRecognitionDialog = ({ open, onOpenChange, cameras, onSaved }: AddRecognitionDialogProps) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.kind === 'plate' && !form.plate) {
      toast.error('Укажите номер ГРЗ');
      return;
    }
    const match = form.match ? parseFloat(form.match.replace(',', '.')) : null;
    if (match !== null && (Number.isNaN(match) || match < 0 || match > 100)) {
      toast.error('Совпадение должно быть от 0 до 100');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(ORD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: form.kind,
          camera_id: form.camera_id ? parseInt(form.camera_id) : null,
          plate: form.kind === 'plate' ? form.plate : null,
          match,
          recognized_at: form.recognized_at || null,
          image_url: form.image_url || null,
          car_image_url: form.car_image_url || null,
          video_url: form.video_url || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Не удалось сохранить запись');
        return;
      }
      toast.success('Распознавание добавлено');
      setForm(emptyForm);
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ScanFace" size={20} />
            Новое распознавание
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Что распознано *</Label>
              <Select value={form.kind} onValueChange={(v) => set('kind', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="face">Лицо</SelectItem>
                  <SelectItem value="plate">Номер (ГРЗ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Камера</Label>
              <Select value={form.camera_id} onValueChange={(v) => set('camera_id', v)}>
                <SelectTrigger><SelectValue placeholder="Выберите камеру" /></SelectTrigger>
                <SelectContent>
                  {cameras.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.kind === 'plate' && (
              <div className="space-y-2">
                <Label>Номер ГРЗ *</Label>
                <Input
                  className="font-mono"
                  placeholder="А123ВС159"
                  value={form.plate}
                  onChange={(e) => set('plate', e.target.value.toUpperCase().replace(/[^АВЕКМНОРСТУХ0-9]/g, ''))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Совпадение, %</Label>
              <Input type="number" min="0" max="100" step="0.1" placeholder="94.5" value={form.match} onChange={(e) => set('match', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Время распознавания</Label>
              <Input type="datetime-local" value={form.recognized_at} onChange={(e) => set('recognized_at', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{form.kind === 'face' ? 'Ссылка на фото лица' : 'Ссылка на фото знака'}</Label>
            <Input placeholder="https://..." value={form.image_url} onChange={(e) => set('image_url', e.target.value)} />
          </div>
          {form.kind === 'plate' && (
            <div className="space-y-2">
              <Label>Ссылка на фото автомобиля</Label>
              <Input placeholder="https://..." value={form.car_image_url} onChange={(e) => set('car_image_url', e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Ссылка на видео</Label>
            <Input placeholder="https://..." value={form.video_url} onChange={(e) => set('video_url', e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Сохраняю...' : 'Добавить'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecognitionDialog;
