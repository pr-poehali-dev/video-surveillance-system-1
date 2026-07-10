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
  camera: string;
  address: string;
  confirmed: boolean | null;
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

const DRONE_TYPES = ['FPV дрон', 'Мавик 3', 'Орлан-10', 'Призма', 'Геоскан 201'];
const ZONES = ['Сектор А-1', 'Сектор А-2', 'Сектор А-3', 'Сектор Б-1', 'Сектор Б-2', 'Сектор Б-3', 'Сектор В-1', 'Сектор В-2', 'Сектор В-3'];
const CAMERAS = [
  'КАМ-01 / Северный КПП', 'КАМ-02 / Западный периметр', 'КАМ-03 / Южный КПП', 'КАМ-04 / Восточная вышка',
  'КАМ-05 / Северная вышка', 'КАМ-06 / Восточный периметр', 'КАМ-07 / Центральный пост', 'КАМ-08 / Запасной пост',
  'КАМ-09 / Юго-западный рубеж', 'КАМ-10 / Юго-восточный рубеж',
];
const ADDRESSES = [
  'г. Пермь, ул. Ленина, 50', 'г. Пермь, ул. Сибирская, 27', 'г. Пермь, ул. Куйбышева, 95',
  'г. Пермь, ул. Пушкина, 3', 'г. Пермь, Комсомольский пр-т, 68', 'г. Пермь, ул. Мира, 12',
  'г. Пермь, ул. Революции, 44', 'г. Пермь, ул. Крисанова, 21', 'г. Пермь, ул. Монастырская, 15',
  'г. Пермь, шоссе Космонавтов, 100',
];
const THREATS: DroneDetection['threat'][] = ['high', 'medium', 'low'];
const STATUSES: DroneDetection['status'][] = ['neutralized', 'active', 'lost'];

const generateDetections = (count: number): DroneDetection[] => {
  const baseLat = 55.7558;
  const baseLng = 37.6173;
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const threat = THREATS[i % THREATS.length];
    const status = STATUSES[i % STATUSES.length];
    const hour = 8 + Math.floor(i / 2);
    const minute = (i * 17) % 60;
    const second = (i * 7) % 60;
    const confirmed = status === 'neutralized' ? true : status === 'lost' && i % 3 === 0 ? false : null;
    return {
      id,
      time: `${String(hour % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      date: '13.05.2026',
      type: DRONE_TYPES[i % DRONE_TYPES.length],
      lat: baseLat + ((i % 10) - 5) * 0.006,
      lng: baseLng + ((i % 7) - 3) * 0.008,
      zone: ZONES[i % ZONES.length],
      threat,
      status,
      altitude: 25 + ((i * 13) % 180),
      speed: 40 + ((i * 11) % 130),
      camera: CAMERAS[i % CAMERAS.length],
      address: ADDRESSES[i % ADDRESSES.length],
      confirmed,
    };
  });
};

export const MOCK_DETECTIONS: DroneDetection[] = generateDetections(50);

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

const groupZoneLetter = (zone: string) => zone.split('-')[0];

export const ZONE_STATS = Object.values(
  MOCK_DETECTIONS.reduce<Record<string, { zone: string; count: number; neutralized: number }>>((acc, d) => {
    const key = groupZoneLetter(d.zone);
    if (!acc[key]) acc[key] = { zone: key, count: 0, neutralized: 0 };
    acc[key].count += 1;
    if (d.status === 'neutralized') acc[key].neutralized += 1;
    return acc;
  }, {})
);

export const TYPE_STATS = Object.values(
  MOCK_DETECTIONS.reduce<Record<string, { type: string; count: number }>>((acc, d) => {
    if (!acc[d.type]) acc[d.type] = { type: d.type, count: 0 };
    acc[d.type].count += 1;
    return acc;
  }, {})
).map((t) => ({ ...t, percent: Math.round((t.count / MOCK_DETECTIONS.length) * 100) }));

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