import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { ImageUploadZone } from '@/components/ord/ImageUploadZone';
import { FaceHistoryResults } from '@/components/ord/FaceHistoryResults';
import type { Recognition } from '@/components/ord/ordApi';
import { CameraMultiSelect, CameraOption } from '@/components/ord/CameraMultiSelect';

interface HistoryFaceTabProps {
  cameras: CameraOption[];
  selectedCameraIds: number[];
  onToggleCamera: (id: number) => void;
  onSelectAllCameras: () => void;
  onResetCameras: () => void;
  selectedImages: File[];
  isDragging: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  results: Recognition[];
  searched: boolean;
  loading: boolean;
  queryImage?: string;
  onSearch: (params: { dateFrom: string; dateTo: string }) => void;
}

export const HistoryFaceTab = ({
  cameras,
  selectedCameraIds,
  onToggleCamera,
  onSelectAllCameras,
  onResetCameras,
  selectedImages,
  isDragging,
  onImageUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  removeImage,
  clearImages,
  results,
  searched,
  loading,
  queryImage,
  onSearch,
}: HistoryFaceTabProps) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={20} />
            Исторический поиск лиц
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">Период от</Label>
              <Input id="date-from" type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Период до</Label>
              <Input id="date-to" type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <CameraMultiSelect
            cameras={cameras}
            selectedIds={selectedCameraIds}
            onToggle={onToggleCamera}
            onSelectAll={onSelectAllCameras}
            onReset={onResetCameras}
          />

          <ImageUploadZone
            selectedImages={selectedImages}
            isDragging={isDragging}
            onImageUpload={onImageUpload}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            removeImage={removeImage}
            clearImages={clearImages}
          />

          <Button className="w-full" onClick={() => onSearch({ dateFrom, dateTo })} disabled={loading}>
            <Icon name="Play" size={16} className="mr-2" />
            Запустить исторический поиск
          </Button>
        </CardContent>
      </Card>

      <FaceHistoryResults results={results} searched={searched} loading={loading} queryImage={queryImage} />
    </div>
  );
};