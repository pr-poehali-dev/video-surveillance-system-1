import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';

interface TagOption {
  id: number;
  name: string;
}

interface CameraTagPickerProps {
  value?: number[];
  onChange?: (tagIds: number[]) => void;
  cameraId?: number;
  active?: boolean;
}

const LINKS_API = `${CAMERAS_SERVICE_API}?resource=camera-tag-links`;

const CameraTagPicker = ({ value, onChange, cameraId, active = true }: CameraTagPickerProps) => {
  const [tags, setTags] = useState<TagOption[]>([]);
  const [own, setOwn] = useState<number[]>([]);
  const selected = value ?? own;

  useEffect(() => {
    if (!active) return;
    fetch(`${CAMERAS_SERVICE_API}?resource=camera-tags`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTags(Array.isArray(d) ? d : []))
      .catch(() => setTags([]));
  }, [active]);

  useEffect(() => {
    if (!active || value !== undefined || !cameraId) return;
    fetch(LINKS_API)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const ids = Array.isArray(d)
          ? d.filter((l: { camera_id: number }) => l.camera_id === cameraId).map((l: { tag_id: number }) => l.tag_id)
          : [];
        setOwn(ids);
      })
      .catch(() => setOwn([]));
  }, [active, cameraId, value]);

  const handleChange = (values: string[]) => {
    const ids = values.map(Number);
    if (value === undefined) {
      setOwn(ids);
      if (cameraId) {
        fetch(LINKS_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ camera_id: cameraId, tag_ids: ids }),
        });
      }
    }
    onChange?.(ids);
  };

  return (
    <div className="space-y-2">
      <Label>Теги</Label>
      <MultiSelectCombobox
        options={tags.map((t) => ({ value: String(t.id), label: t.name }))}
        selected={selected.map(String)}
        onChange={handleChange}
        placeholder="Выберите теги"
        searchPlaceholder="Поиск тега..."
      />
    </div>
  );
};

export default CameraTagPicker;
