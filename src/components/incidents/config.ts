export type IncidentCategory = 'security' | 'emergency' | 'improvement';

export interface EventTypeInfo {
  value: string;
  label: string;
  icon: string;
}

export interface CategoryConfig {
  category: IncidentCategory;
  title: string;
  description: string;
  types: EventTypeInfo[];
}

export const CATEGORIES: Record<IncidentCategory, CategoryConfig> = {
  security: {
    category: 'security',
    title: 'Безопасность',
    description: 'Драки, скопления людей и оставленные предметы',
    types: [
      { value: 'fight', label: 'Драка', icon: 'Swords' },
      { value: 'crowd', label: 'Толпа', icon: 'Users' },
      { value: 'abandoned_object', label: 'Оставленный предмет', icon: 'Package' },
    ],
  },
  emergency: {
    category: 'emergency',
    title: 'ЧС',
    description: 'Дым и огонь',
    types: [{ value: 'smoke_fire', label: 'Дым и огонь', icon: 'Flame' }],
  },
  improvement: {
    category: 'improvement',
    title: 'Благоустройство',
    description: 'Граффити',
    types: [{ value: 'graffiti', label: 'Граффити', icon: 'PaintBucket' }],
  },
};

export interface IncidentEvent {
  id: number;
  category: IncidentCategory;
  event_type: string;
  date: string;
  time: string;
  camera_id: number | null;
  camera_name: string;
  address: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'confirmed' | 'rejected' | 'resolved';
  confidence: number | null;
  photo_url: string | null;
  description: string;
}

export const PRIORITY_LABEL: Record<string, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
export const PRIORITY_CLASS: Record<string, string> = {
  high: 'bg-red-500/15 text-red-600 border-red-500/30',
  medium: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
  low: 'bg-green-500/15 text-green-600 border-green-500/30',
};
export const STATUS_LABEL: Record<string, string> = {
  new: 'Новое',
  confirmed: 'Подтверждено',
  rejected: 'Отклонено',
  resolved: 'Устранено',
};
