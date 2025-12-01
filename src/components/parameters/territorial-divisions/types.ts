export interface Territory {
  id: number;
  name: string;
  camera_count: number;
  parent_id: number | null;
  color: string;
  created_at?: string;
  updated_at?: string;
  children?: Territory[];
}

export interface TerritoryFormData {
  name: string;
  camera_count: number;
  parent_id: number | null;
  color: string;
}

export const API_URL = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';

export const colorOptions = [
  { value: 'bg-blue-500', label: 'Синий' },
  { value: 'bg-green-500', label: 'Зелёный' },
  { value: 'bg-orange-500', label: 'Оранжевый' },
  { value: 'bg-red-500', label: 'Красный' },
  { value: 'bg-purple-500', label: 'Фиолетовый' },
  { value: 'bg-pink-500', label: 'Розовый' },
  { value: 'bg-blue-400', label: 'Светло-синий' },
  { value: 'bg-green-400', label: 'Светло-зелёный' },
];
