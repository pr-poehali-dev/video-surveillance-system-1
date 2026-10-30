import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { INCIDENTS_API } from './api';
import { PRIORITY_LABEL } from './config';
import type { CategoryConfig } from './config';

interface AddIncidentDialogProps {
  config: CategoryConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const AddIncidentDialog = ({ config, open, onOpenChange, onSaved }: AddIncidentDialogProps) => {
  const [form, setForm] = useState({
    event_type: config.types[0].value,
    camera_name: '',
    address: '',
    priority: 'medium',
    confidence: '',
    photo_url: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const confidence = form.confidence ? Math.min(100, Math.max(0, parseInt(form.confidence, 10))) : null;
    const res = await fetch(INCIDENTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: config.category,
        event_type: form.event_type,
        camera_name: form.camera_name || null,
        address: form.address || null,
        priority: form.priority,
        confidence,
        photo_url: form.photo_url || null,
        description: form.description || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error('Не удалось сохранить событие');
      return;
    }
    toast.success('Событие добавлено');
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить событие</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {config.types.length > 1 && (
            <div className="space-y-1">
              <Label>Тип события</Label>
              <Select value={form.event_type} onValueChange={(v) => set('event_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {config.types.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Камера</Label>
              <Input value={form.camera_name} onChange={(e) => set('camera_name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Приоритет</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Адрес</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Уверенность, %</Label>
              <Input type="number" min={0} max={100} value={form.confidence} onChange={(e) => set('confidence', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Ссылка на фото</Label>
              <Input value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Описание</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={saving}>Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncidentDialog;
