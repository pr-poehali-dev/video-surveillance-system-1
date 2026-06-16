import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { SearchResultCard, SearchResult } from './SearchResultCard';
import { DetectionsDialog } from './DetectionsDialog';
import { EditCardDialog } from './EditCardDialog';

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [localResults, setLocalResults] = useState<SearchResult[]>(results);

  // edit state
  const [editTarget, setEditTarget] = useState<SearchResult | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEmails, setEditEmails] = useState<string[]>(['']);
  const [editMaxNicknames, setEditMaxNicknames] = useState<string[]>(['']);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editTab, setEditTab] = useState<'info' | 'photos' | 'emails' | 'max'>('info');

  // delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const openEdit = (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(result);
    setEditName(result.name ?? '');
    setEditDescription('');
    setEditEmails(result.emails?.length ? [...result.emails] : ['']);
    setEditMaxNicknames(['']);
    setEditImages(result.extraImages ?? []);
    setEditTab('info');
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    setLocalResults((prev) => prev.filter((r) => r.id !== deleteConfirmId));
    setDeleteConfirmId(null);
    toast.success('Карточка удалена');
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Результаты мониторинга лиц</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {localResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onClick={() => setSelected(result)}
                  onEdit={(e) => openEdit(result, e)}
                  onDelete={(e) => handleDelete(result.id, e)}
                />
              ))}

              {localResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Результаты поиска появятся здесь</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <DetectionsDialog
        selected={selected}
        onClose={() => setSelected(null)}
      />

      <EditCardDialog
        editTarget={editTarget}
        onClose={() => setEditTarget(null)}
        editTab={editTab}
        setEditTab={setEditTab}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editEmails={editEmails}
        setEditEmails={setEditEmails}
        editMaxNicknames={editMaxNicknames}
        setEditMaxNicknames={setEditMaxNicknames}
        editImages={editImages}
        setEditImages={setEditImages}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(v) => { if (!v) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icon name="Trash2" size={18} />
              Удалить карточку?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Карточка искомого лица будет удалена безвозвратно.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
