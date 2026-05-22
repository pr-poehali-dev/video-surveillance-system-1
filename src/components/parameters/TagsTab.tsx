import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Tag {
  id: number;
  name: string;
  color: string;
  description: string;
}

const API_URL = 'https://functions.poehali.dev/8fc68413-edf0-464e-8e75-bee111a4b28c';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6b7280',
];

interface FormData {
  name: string;
  color: string;
  description: string;
}

const FormFields = ({ formData, setFormData }: { formData: FormData; setFormData: React.Dispatch<React.SetStateAction<FormData>> }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Название *</Label>
      <Input
        placeholder="Введите название тега"
        value={formData.name}
        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
      />
    </div>
    <div className="space-y-2">
      <Label>Цвет</Label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className="w-7 h-7 rounded-full border-2 transition-all"
            style={{
              backgroundColor: c,
              borderColor: formData.color === c ? '#000' : 'transparent',
              transform: formData.color === c ? 'scale(1.2)' : 'scale(1)',
            }}
            onClick={() => setFormData((p) => ({ ...p, color: c }))}
          />
        ))}
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
          className="w-7 h-7 rounded cursor-pointer border border-border"
          title="Свой цвет"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label>Описание</Label>
      <Input
        placeholder="Описание тега (необязательно)"
        value={formData.description}
        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
      />
    </div>
  </div>
);

export const TagsTab = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#6366f1', description: '' });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Ошибка загрузки тегов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTags(); }, []);

  const resetForm = () => setFormData({ name: '', color: '#6366f1', description: '' });

  const handleAdd = async () => {
    if (!formData.name.trim()) { toast.error('Введите название тега'); return; }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      await fetchTags();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Тег создан');
    } catch {
      toast.error('Ошибка создания тега');
    }
  };

  const handleEdit = async () => {
    if (!editingTag || !formData.name.trim()) { toast.error('Введите название тега'); return; }
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingTag.id }),
      });
      if (!res.ok) throw new Error();
      await fetchTags();
      setIsEditDialogOpen(false);
      setEditingTag(null);
      toast.success('Тег обновлён');
    } catch {
      toast.error('Ошибка обновления тега');
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      const res = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tagToDelete.id }),
      });
      if (!res.ok) throw new Error();
      await fetchTags();
      setIsDeleteDialogOpen(false);
      setTagToDelete(null);
      toast.success('Тег удалён');
    } catch {
      toast.error('Ошибка удаления тега');
    }
  };

  const filtered = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск тегов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать тег
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Tag" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Теги не найдены' : 'Теги ещё не созданы'}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 p-1">
            {filtered.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-md"
                style={{ borderColor: tag.color, color: tag.color, backgroundColor: tag.color + '18' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
                {tag.description && (
                  <span className="text-xs opacity-60 hidden group-hover:inline">— {tag.description}</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 ml-1">
                  <button
                    onClick={() => {
                      setEditingTag(tag);
                      setFormData({ name: tag.name, color: tag.color, description: tag.description });
                      setIsEditDialogOpen(true);
                    }}
                    className="p-0.5 rounded hover:bg-black/10 transition-colors"
                  >
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button
                    onClick={() => { setTagToDelete(tag); setIsDeleteDialogOpen(true); }}
                    className="p-0.5 rounded hover:bg-black/10 transition-colors"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать тег</DialogTitle>
          </DialogHeader>
          <FormFields formData={formData} setFormData={setFormData} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать тег</DialogTitle>
          </DialogHeader>
          <FormFields formData={formData} setFormData={setFormData} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEdit}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить тег?</AlertDialogTitle>
            <AlertDialogDescription>
              Тег «{tagToDelete?.name}» будет удалён. Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TagsTab;