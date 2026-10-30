import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { INCIDENTS_API } from './api';
import AddIncidentDialog from './AddIncidentDialog';
import { CATEGORIES, PRIORITY_CLASS, PRIORITY_LABEL, STATUS_LABEL } from './config';
import type { IncidentCategory, IncidentEvent } from './config';

interface IncidentsPageProps {
  category: IncidentCategory;
}

const IncidentsPage = ({ category }: IncidentsPageProps) => {
  const config = CATEGORIES[category];
  const { can } = usePermissions();
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [photo, setPhoto] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${INCIDENTS_API}&category=${category}`);
      const d = await r.json();
      setEvents(Array.isArray(d) ? d : []);
    } catch {
      toast.error('Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const update = async (id: number, patch: Record<string, unknown>) => {
    const res = await fetch(INCIDENTS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) {
      toast.error('Не удалось сохранить изменение');
      return;
    }
    load();
  };

  const remove = async (id: number) => {
    const res = await fetch(INCIDENTS_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error('Не удалось удалить событие');
      return;
    }
    toast.success('Событие удалено');
    load();
  };

  const typeInfo = (value: string) => config.types.find((t) => t.value === value);

  const filtered = useMemo(
    () =>
      events.filter(
        (e) => (typeFilter === 'all' || e.event_type === typeFilter) && (statusFilter === 'all' || e.status === statusFilter)
      ),
    [events, typeFilter, statusFilter]
  );

  const newCount = events.filter((e) => e.status === 'new').length;
  const highCount = events.filter((e) => e.priority === 'high' && e.status === 'new').length;

  const canCreate = can(`${category}Create` as never);
  const canEdit = can(`${category}Edit` as never);
  const canDelete = can(`${category}Delete` as never);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">{config.description}</p>
        {canCreate && (
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить событие
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Всего</div><div className="text-2xl font-bold">{events.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Новые</div><div className="text-2xl font-bold text-primary">{newCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Высокий приоритет</div><div className="text-2xl font-bold text-red-500">{highCount}</div></CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        {config.types.length > 1 && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {config.types.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Событий пока нет</CardContent></Card>
        ) : (
          filtered.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-start gap-4 flex-wrap">
                {e.photo_url ? (
                  <button type="button" onClick={() => setPhoto(e.photo_url)} className="shrink-0">
                    <img src={e.photo_url} alt="" className="w-24 h-16 object-cover rounded-md border" />
                  </button>
                ) : (
                  <div className="w-24 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon name={(typeInfo(e.event_type)?.icon || 'Camera') as never} size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-[220px] space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{typeInfo(e.event_type)?.label || e.event_type}</span>
                    <Badge variant="outline" className={PRIORITY_CLASS[e.priority]}>{PRIORITY_LABEL[e.priority]}</Badge>
                    <Badge variant="secondary">{STATUS_LABEL[e.status]}</Badge>
                    {e.confidence !== null && <span className="text-xs text-muted-foreground">{e.confidence}%</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{e.date} {e.time}{e.camera_name ? ` · ${e.camera_name}` : ''}</div>
                  {e.address && <div className="text-sm">{e.address}</div>}
                  {e.description && <div className="text-sm text-muted-foreground">{e.description}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {canEdit && e.status === 'new' && (
                    <>
                      <Button size="sm" onClick={() => update(e.id, { status: 'confirmed' })}>Подтвердить</Button>
                      <Button size="sm" variant="outline" onClick={() => update(e.id, { status: 'rejected' })}>Отклонить</Button>
                    </>
                  )}
                  {canEdit && e.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => update(e.id, { status: 'resolved' })}>Устранено</Button>
                  )}
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => remove(e.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {canCreate && <AddIncidentDialog key={String(addOpen)} config={config} open={addOpen} onOpenChange={setAddOpen} onSaved={load} />}

      {photo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setPhoto(null)}>
          <img src={photo} alt="" className="max-h-full max-w-full rounded-md" />
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
