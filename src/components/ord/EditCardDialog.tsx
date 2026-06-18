import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { SearchResult } from './SearchResultCard';

interface EditCardDialogProps {
  editTarget: SearchResult | null;
  onClose: () => void;
  editTab: 'info' | 'photos' | 'emails' | 'max';
  setEditTab: (tab: 'info' | 'photos' | 'emails' | 'max') => void;
  editName: string;
  setEditName: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editPlate: string;
  setEditPlate: (v: string) => void;
  editEmails: string[];
  setEditEmails: (v: string[]) => void;
  editMaxNicknames: string[];
  setEditMaxNicknames: (v: string[]) => void;
  editImages: string[];
  setEditImages: (v: string[] | ((prev: string[]) => string[])) => void;
}

export const EditCardDialog = ({
  editTarget,
  onClose,
  editTab,
  setEditTab,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editPlate,
  setEditPlate,
  editEmails,
  setEditEmails,
  editMaxNicknames,
  setEditMaxNicknames,
  editImages,
  setEditImages,
}: EditCardDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setEditImages((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Pencil" size={18} />
            Редактировать карточку
            <DialogClose asChild className="ml-auto">
              <Button size="icon" variant="secondary">
                <Icon name="X" size={16} />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 border-b pb-2 mb-4">
          {([
            { key: 'info', label: 'Основное', icon: 'FileText' },
            { key: 'photos', label: 'Фото', icon: 'Camera' },
            { key: 'emails', label: 'E-mail', icon: 'Mail' },
            { key: 'max', label: 'MAX', icon: 'MessageSquare' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setEditTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                editTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {editTab === 'info' && (
          <div className="space-y-4">
            {editTarget?.type === 'plate' && (
              <div className="space-y-2">
                <Label htmlFor="edit-plate">Государственный регистрационный знак</Label>
                <Input
                  id="edit-plate"
                  placeholder="А000АА00"
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  className="font-mono tracking-widest text-base uppercase"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Наименование</Label>
              <Input
                id="edit-name"
                placeholder="Введите имя или псевдоним"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Описание</Label>
              <textarea
                id="edit-desc"
                rows={4}
                placeholder="Дополнительная информация об искомом лице..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {editTab === 'photos' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Загрузите дополнительные фото для уточнения поиска</p>
            <div className="flex flex-wrap gap-3">
              {editTarget?.image && (
                <div className="relative">
                  <img src={editTarget.image} alt="Основное" className="w-32 h-40 rounded-lg object-cover border-2 border-primary" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">осн.</span>
                </div>
              )}
              {editImages.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`Фото ${i + 1}`} className="w-32 h-40 rounded-lg object-cover border" />
                  <button
                    onClick={() => setEditImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <Icon name="X" size={10} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <Icon name="Plus" size={24} />
                <span className="text-xs">Добавить фото</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
            </div>
          </div>
        )}

        {editTab === 'emails' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Адреса для отправки уведомлений при совпадении</p>
            <div className="space-y-2">
              {editEmails.map((email, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => {
                      const updated = [...editEmails];
                      updated[idx] = e.target.value;
                      setEditEmails(updated);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditEmails(editEmails.filter((_, i) => i !== idx))}
                    disabled={editEmails.length === 1}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setEditEmails([...editEmails, ''])}>
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить e-mail
              </Button>
            </div>
          </div>
        )}

        {editTab === 'max' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Никнеймы пользователей MAX для уведомлений при совпадении</p>
            <div className="space-y-2">
              {editMaxNicknames.map((nick, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="@никнейм"
                    value={nick}
                    onChange={(e) => {
                      const updated = [...editMaxNicknames];
                      updated[idx] = e.target.value;
                      setEditMaxNicknames(updated);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditMaxNicknames(editMaxNicknames.filter((_, i) => i !== idx))}
                    disabled={editMaxNicknames.length === 1}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setEditMaxNicknames([...editMaxNicknames, ''])}>
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить никнейм
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t mt-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => { onClose(); toast.success('Карточка обновлена'); }}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};