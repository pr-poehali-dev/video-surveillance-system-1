import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface OwnerOption {
  id: number;
  name: string;
  parent_id: number | null;
}

interface OwnersSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owners: OwnerOption[];
  selectedIds: number[];
  saving: boolean;
  onSave: (ids: number[]) => void;
}

const OwnersSelectDialog = ({ open, onOpenChange, owners, selectedIds, saving, onSave }: OwnersSelectDialogProps) => {
  const [draft, setDraft] = useState<number[]>(selectedIds);

  useEffect(() => {
    if (open) setDraft(selectedIds);
  }, [open, selectedIds]);

  const rows = useMemo(() => {
    const result: { owner: OwnerOption; depth: number }[] = [];
    const walk = (parentId: number | null, depth: number) => {
      owners
        .filter((o) => o.parent_id === parentId)
        .forEach((o) => {
          result.push({ owner: o, depth });
          walk(o.id, depth + 1);
        });
    };
    walk(null, 0);
    return result;
  }, [owners]);

  const toggle = (id: number) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Собственники камер на дашборде</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Отметьте собственников, которые нужно показывать в блоке. Если ничего не выбрано, показываются органы государственной власти по умолчанию.
        </p>
        <ScrollArea className="h-[360px] border rounded-lg p-2">
          {rows.map(({ owner, depth }) => (
            <label
              key={owner.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer text-sm"
              style={{ paddingLeft: 8 + depth * 20 }}
            >
              <Checkbox checked={draft.includes(owner.id)} onCheckedChange={() => toggle(owner.id)} />
              <span className={depth === 0 ? 'font-semibold' : ''}>{owner.name}</span>
            </label>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">В реестре нет собственников камер</p>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => setDraft([])}>Сбросить выбор</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={() => onSave(draft)} disabled={saving}>
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OwnersSelectDialog;
