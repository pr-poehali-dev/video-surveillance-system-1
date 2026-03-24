import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const CAMERA_URL = 'https://functions.poehali.dev/712d5c60-998d-49d9-8252-705500df28c7';

const CSV_COLUMNS = ['name', 'rtsp_url', 'owner', 'territorial_division', 'latitude', 'longitude', 'address', 'rtsp_login', 'rtsp_password', 'archive_depth_days'];
const REQUIRED_COLUMNS = ['name', 'rtsp_url', 'owner', 'territorial_division', 'latitude', 'longitude'];

const EXAMPLE_CSV = `name;rtsp_url;owner;territorial_division;latitude;longitude;address;rtsp_login;rtsp_password;archive_depth_days
Камера №1;rtsp://192.168.1.1/stream;ГУ МВД;Ленинский район;58.0105;56.2502;ул. Ленина 1;;; 30
Камера №2;rtsp://192.168.1.2/stream;ФСИН;Свердловский район;57.9985;56.2631;ул. Пушкина 5;admin;12345;7`;

interface ParsedRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
  valid: boolean;
}

interface BulkAddCameraDialogProps {
  onSuccess: () => void;
}

export const BulkAddCameraDialog = ({ onSuccess }: BulkAddCameraDialogProps) => {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return [];

    const header = lines[0].split(';').map(h => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim());
      const data: Record<string, string> = {};
      header.forEach((col, idx) => {
        data[col] = values[idx] || '';
      });

      const errors: string[] = [];
      REQUIRED_COLUMNS.forEach(col => {
        if (!data[col]) errors.push(`Поле "${col}" обязательно`);
      });
      if (data.latitude && isNaN(parseFloat(data.latitude))) errors.push('latitude должно быть числом');
      if (data.longitude && isNaN(parseFloat(data.longitude))) errors.push('longitude должно быть числом');

      rows.push({ index: i, data, errors, valid: errors.length === 0 });
    }
    return rows;
  };

  const handleParse = () => {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      toast.error('Не удалось разобрать CSV. Проверьте формат.');
      return;
    }
    setParsed(rows);
    setStep('preview');
  };

  const handleDownloadTemplate = () => {
    const header = CSV_COLUMNS.join(';');
    const example1 = 'Камера №1;rtsp://192.168.1.1/stream;ГУ МВД;Ленинский район;58.0105;56.2502;ул. Ленина 1;;;30';
    const example2 = 'Камера №2;rtsp://192.168.1.2/stream;ФСИН;Свердловский район;57.9985;56.2631;ул. Пушкина 5;admin;12345;7';
    const csv = '\uFEFF' + [header, example1, example2].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'шаблон_камеры.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Шаблон скачан');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    const validRows = parsed.filter(r => r.valid);
    if (validRows.length === 0) {
      toast.error('Нет валидных строк для импорта');
      return;
    }
    setLoading(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        const body: Record<string, string | number> = {
          name: row.data.name,
          rtsp_url: row.data.rtsp_url,
          owner: row.data.owner,
          territorial_division: row.data.territorial_division,
          latitude: parseFloat(row.data.latitude),
          longitude: parseFloat(row.data.longitude),
        };
        if (row.data.address) body.address = row.data.address;
        if (row.data.rtsp_login) body.rtsp_login = row.data.rtsp_login;
        if (row.data.rtsp_password) body.rtsp_password = row.data.rtsp_password;
        if (row.data.archive_depth_days) body.archive_depth_days = parseInt(row.data.archive_depth_days) || 30;

        const res = await fetch(CAMERA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setLoading(false);
    if (success > 0) {
      toast.success(`Добавлено камер: ${success}${failed > 0 ? `, ошибок: ${failed}` : ''}`);
      onSuccess();
      handleClose();
    } else {
      toast.error('Не удалось добавить ни одной камеры');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCsvText('');
    setParsed([]);
    setStep('input');
  };

  const validCount = parsed.filter(r => r.valid).length;
  const invalidCount = parsed.filter(r => !r.valid).length;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Icon name="Upload" size={16} className="mr-2" />
        Массовое добавление
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} />
              Массовое добавление камер
            </DialogTitle>
          </DialogHeader>

          {step === 'input' && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p className="font-medium">Формат CSV (разделитель — точка с запятой):</p>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {CSV_COLUMNS.join(';')}
                </p>
                <p className="text-muted-foreground text-xs">* Обязательные: {REQUIRED_COLUMNS.join(', ')}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" onClick={handleDownloadTemplate}>
                  <Icon name="FileDown" size={14} className="mr-1" />
                  Скачать шаблон Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Icon name="FileUp" size={14} className="mr-1" />
                  Загрузить заполненный файл
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCsvText(EXAMPLE_CSV)}>
                  <Icon name="ClipboardList" size={14} className="mr-1" />
                  Вставить пример
                </Button>
                <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx" className="hidden" onChange={handleFileUpload} />
              </div>

              <Textarea
                className="font-mono text-xs h-48"
                placeholder={`Вставьте CSV данные или загрузите файл...\n\n${EXAMPLE_CSV}`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="default">{validCount} готовы к импорту</Badge>
                {invalidCount > 0 && <Badge variant="destructive">{invalidCount} с ошибками</Badge>}
              </div>
              <ScrollArea className="h-72 border rounded-md">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Название</th>
                      <th className="p-2 text-left">RTSP URL</th>
                      <th className="p-2 text-left">Владелец</th>
                      <th className="p-2 text-left">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row) => (
                      <tr key={row.index} className={row.valid ? '' : 'bg-red-50 dark:bg-red-950/20'}>
                        <td className="p-2 text-muted-foreground">{row.index}</td>
                        <td className="p-2">{row.data.name || '—'}</td>
                        <td className="p-2 max-w-[200px] truncate">{row.data.rtsp_url || '—'}</td>
                        <td className="p-2">{row.data.owner || '—'}</td>
                        <td className="p-2">
                          {row.valid ? (
                            <Badge variant="default" className="text-xs">OK</Badge>
                          ) : (
                            <span className="text-destructive text-xs">{row.errors[0]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            {step === 'input' ? (
              <>
                <Button variant="outline" onClick={handleClose}>Отмена</Button>
                <Button onClick={handleParse} disabled={!csvText.trim()}>
                  <Icon name="Eye" size={16} className="mr-2" />
                  Проверить данные
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep('input')}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <Button onClick={handleImport} disabled={loading || validCount === 0}>
                  {loading
                    ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    : <Icon name="Check" size={16} className="mr-2" />}
                  Импортировать {validCount} камер
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkAddCameraDialog;