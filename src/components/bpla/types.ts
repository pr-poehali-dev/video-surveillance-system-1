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
  photo_url: string | null;
}

export interface Alert {
  id: number;
  time: string;
  date: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  zone: string;
}

export const DRONE_TYPES = ['FPV дрон', 'Мавик 3', 'Орлан-10', 'Призма', 'Геоскан 201', 'Другой'];

const groupZoneLetter = (zone: string) => zone.split('-')[0] || 'Без сектора';

export const computeZoneStats = (detections: DroneDetection[]) =>
  Object.values(
    detections.reduce<Record<string, { zone: string; count: number; neutralized: number }>>((acc, d) => {
      const key = groupZoneLetter(d.zone);
      if (!acc[key]) acc[key] = { zone: key, count: 0, neutralized: 0 };
      acc[key].count += 1;
      if (d.status === 'neutralized') acc[key].neutralized += 1;
      return acc;
    }, {})
  );

export const computeTypeStats = (detections: DroneDetection[]) =>
  Object.values(
    detections.reduce<Record<string, { type: string; count: number }>>((acc, d) => {
      if (!acc[d.type]) acc[d.type] = { type: d.type, count: 0 };
      acc[d.type].count += 1;
      return acc;
    }, {})
  ).map((t) => ({ ...t, percent: detections.length ? Math.round((t.count / detections.length) * 100) : 0 }));

export const buildAlerts = (detections: DroneDetection[]): Alert[] =>
  detections.map((d) => {
    const base = `${d.type}, ${d.zone || 'сектор не указан'}`;
    if (d.status === 'neutralized') {
      return { id: d.id, time: d.time, date: d.date, zone: d.zone, type: 'info' as const, message: `${base}: нейтрализован. Угроза устранена.` };
    }
    if (d.status === 'lost') {
      return { id: d.id, time: d.time, date: d.date, zone: d.zone, type: 'warning' as const, message: `${base}: потерян из поля зрения.` };
    }
    return {
      id: d.id, time: d.time, date: d.date, zone: d.zone,
      type: d.threat === 'high' ? ('danger' as const) : ('warning' as const),
      message: `Обнаружен ${base}. Угроза: ${threatLabel(d.threat).toLowerCase()}.`,
    };
  });

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