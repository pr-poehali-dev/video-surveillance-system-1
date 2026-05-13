export interface DroneDetection {
  id: number;
  time: string;
  date: string;
  type: string;
  lat: number;
  lng: number;
  zone: string;
  threat: 'high' | 'medium' | 'low';
  status: 'active' | 'neutralized' | 'lost';
  altitude: number;
  speed: number;
}

export interface Alert {
  id: number;
  time: string;
  date: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  zone: string;
}

export const DRONE_PHOTOS = [
  'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/ca747297-0f03-4a81-a7c0-d9c85249c00f.jpg',
  'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/90524074-896a-4c08-b1db-50a7e50da74b.jpg',
  'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/b45e602a-ec96-4d87-bcfa-6f686fc45980.jpg',
  'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/c771ba05-2b32-4c19-8952-ed70450fa15e.jpg',
  'https://cdn.poehali.dev/projects/4c19713d-6165-48ef-affa-df5d72064acb/files/ab0415ea-68b8-4041-92f4-609e6230e815.jpg',
];

export const MOCK_DETECTIONS: DroneDetection[] = [
  { id: 1, time: '09:14:22', date: '13.05.2026', type: 'FPV дрон', lat: 55.7558, lng: 37.6173, zone: 'Сектор А-1', threat: 'high', status: 'neutralized', altitude: 45, speed: 120 },
  { id: 2, time: '10:32:07', date: '13.05.2026', type: 'Мавик 3', lat: 55.7612, lng: 37.6310, zone: 'Сектор Б-2', threat: 'medium', status: 'lost', altitude: 80, speed: 65 },
  { id: 3, time: '11:05:44', date: '13.05.2026', type: 'FPV дрон', lat: 55.7489, lng: 37.6055, zone: 'Сектор А-3', threat: 'high', status: 'active', altitude: 30, speed: 140 },
  { id: 4, time: '12:18:33', date: '13.05.2026', type: 'Орлан-10', lat: 55.7701, lng: 37.6440, zone: 'Сектор В-1', threat: 'high', status: 'neutralized', altitude: 200, speed: 90 },
  { id: 5, time: '13:44:11', date: '13.05.2026', type: 'Мавик 3', lat: 55.7530, lng: 37.6250, zone: 'Сектор Б-1', threat: 'low', status: 'lost', altitude: 60, speed: 55 },
  { id: 6, time: '14:02:58', date: '13.05.2026', type: 'Призма', lat: 55.7640, lng: 37.6100, zone: 'Сектор А-2', threat: 'medium', status: 'active', altitude: 150, speed: 75 },
  { id: 7, time: '14:55:20', date: '13.05.2026', type: 'FPV дрон', lat: 55.7510, lng: 37.6380, zone: 'Сектор В-2', threat: 'high', status: 'neutralized', altitude: 25, speed: 160 },
  { id: 8, time: '15:30:05', date: '13.05.2026', type: 'Мавик 3', lat: 55.7580, lng: 37.6200, zone: 'Сектор Б-3', threat: 'low', status: 'lost', altitude: 70, speed: 50 },
];

export const MOCK_ALERTS: Alert[] = [
  { id: 1, time: '09:14:22', date: '13.05.2026', message: 'Обнаружен FPV дрон в секторе А-1. Угроза высокая. Активирована система РЭБ.', type: 'danger', zone: 'Сектор А-1' },
  { id: 2, time: '09:16:10', date: '13.05.2026', message: 'FPV дрон нейтрализован. Угроза устранена.', type: 'info', zone: 'Сектор А-1' },
  { id: 3, time: '10:32:07', date: '13.05.2026', message: 'Зафиксирован Мавик 3 в секторе Б-2. Угроза средняя.', type: 'warning', zone: 'Сектор Б-2' },
  { id: 4, time: '10:45:30', date: '13.05.2026', message: 'Мавик 3 потерян из поля зрения. Ведётся наблюдение.', type: 'warning', zone: 'Сектор Б-2' },
  { id: 5, time: '11:05:44', date: '13.05.2026', message: '⚠ ТРЕВОГА! FPV дрон в секторе А-3. Высокая угроза. Скорость 140 км/ч.', type: 'danger', zone: 'Сектор А-3' },
  { id: 6, time: '12:18:33', date: '13.05.2026', message: 'Обнаружен Орлан-10 на высоте 200м. Подозрение на разведывательный.', type: 'danger', zone: 'Сектор В-1' },
  { id: 7, time: '12:34:50', date: '13.05.2026', message: 'Орлан-10 нейтрализован системой РЭБ.', type: 'info', zone: 'Сектор В-1' },
  { id: 8, time: '14:02:58', date: '13.05.2026', message: 'Обнаружен БПЛА типа Призма в секторе А-2. Ведётся слежение.', type: 'warning', zone: 'Сектор А-2' },
];

export const ZONE_STATS = [
  { zone: 'Сектор А', count: 3, neutralized: 2 },
  { zone: 'Сектор Б', count: 3, neutralized: 0 },
  { zone: 'Сектор В', count: 2, neutralized: 1 },
];

export const TYPE_STATS = [
  { type: 'FPV дрон', count: 3, percent: 37 },
  { type: 'Мавик 3', count: 3, percent: 37 },
  { type: 'Орлан-10', count: 1, percent: 13 },
  { type: 'Призма', count: 1, percent: 13 },
];

export const threatColor = (t: DroneDetection['threat']) => {
  if (t === 'high') return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (t === 'medium') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  return 'bg-green-500/10 text-green-500 border-green-500/20';
};

export const threatLabel = (t: DroneDetection['threat']) => {
  if (t === 'high') return 'Высокая';
  if (t === 'medium') return 'Средняя';
  return 'Низкая';
};

export const statusColor = (s: DroneDetection['status']) => {
  if (s === 'active') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (s === 'neutralized') return 'bg-green-500/10 text-green-400 border-green-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

export const statusLabel = (s: DroneDetection['status']) => {
  if (s === 'active') return 'Активен';
  if (s === 'neutralized') return 'Нейтрализован';
  return 'Потерян';
};

export const alertBg = (t: Alert['type']) => {
  if (t === 'danger') return 'border-l-4 border-red-500 bg-red-500/5';
  if (t === 'warning') return 'border-l-4 border-yellow-500 bg-yellow-500/5';
  return 'border-l-4 border-blue-500 bg-blue-500/5';
};

export const alertIcon = (t: Alert['type']) => {
  if (t === 'danger') return 'AlertTriangle';
  if (t === 'warning') return 'AlertCircle';
  return 'Info';
};

export const alertIconColor = (t: Alert['type']) => {
  if (t === 'danger') return 'text-red-500';
  if (t === 'warning') return 'text-yellow-500';
  return 'text-blue-500';
};
