import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { SearchResults } from '@/components/ord/SearchResults';
import { CameraMultiSelect, CameraOption } from '@/components/ord/CameraMultiSelect';

interface SearchResult {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera: string;
  address: string;
  image: string;
  plate?: string;
}

interface HistoryPlateTabProps {
  cameras: CameraOption[];
  selectedPlateCameraIds: number[];
  onTogglePlateCamera: (id: number) => void;
  onSelectAllPlateCameras: () => void;
  onResetPlateCameras: () => void;
  plateSearch: string;
  setPlateSearch: (v: string) => void;
  handlePlateSearch: () => void;
  mockResults: SearchResult[];
}

export const HistoryPlateTab = ({
  cameras,
  selectedPlateCameraIds,
  onTogglePlateCamera,
  onSelectAllPlateCameras,
  onResetPlateCameras,
  plateSearch,
  setPlateSearch,
  handlePlateSearch,
  mockResults,
}: HistoryPlateTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={20} />
            Исторический поиск по ГРЗ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="history-plate-search">Государственный регистрационный знак <span className="text-destructive">*</span></Label>
            <Input
              id="history-plate-search"
              placeholder="Например: А123ВС159"
              value={plateSearch}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                const filtered = value.replace(/[^АВЕКМНОРСТУХ0-9]/g, '');
                setPlateSearch(filtered);
              }}
              className="font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="history-date-from">Период от</Label>
              <Input id="history-date-from" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-date-to">Период до</Label>
              <Input id="history-date-to" type="datetime-local" />
            </div>
          </div>

          <CameraMultiSelect
            cameras={cameras}
            selectedIds={selectedPlateCameraIds}
            onToggle={onTogglePlateCamera}
            onSelectAll={onSelectAllPlateCameras}
            onReset={onResetPlateCameras}
          />

          <Button className="w-full" onClick={handlePlateSearch}>
            <Icon name="Search" size={16} className="mr-2" />
            Найти в истории
          </Button>
        </CardContent>
      </Card>

      <SearchResults results={mockResults.filter((r) => r.type === 'plate')} />
    </div>
  );
};
