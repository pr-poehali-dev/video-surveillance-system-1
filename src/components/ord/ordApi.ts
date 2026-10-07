import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';
import type { SearchResult } from './SearchResultCard';

export const ORD_API = `${CAMERAS_SERVICE_API}?resource=ord-recognitions`;

export interface Recognition extends SearchResult {
  camera_id: number | null;
  lat: number | null;
  lng: number | null;
  carImage?: string;
  videoUrl?: string;
}

interface RawRecognition {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera_id: number | null;
  camera: string;
  address: string;
  lat: number | null;
  lng: number | null;
  plate: string | null;
  image: string | null;
  car_image: string | null;
  video_url: string | null;
}

const normalize = (r: RawRecognition): Recognition => ({
  id: r.id,
  type: r.type,
  match: r.match,
  time: r.time,
  camera_id: r.camera_id,
  camera: r.camera,
  address: r.address,
  lat: r.lat,
  lng: r.lng,
  plate: r.plate ?? undefined,
  image: r.image ?? undefined,
  carImage: r.car_image ?? undefined,
  videoUrl: r.video_url ?? undefined,
});

export const fetchRecognitions = async (
  params: Record<string, string | undefined>
): Promise<Recognition[]> => {
  const query = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join('&');
  const res = await fetch(`${ORD_API}${query ? `&${query}` : ''}`);
  if (!res.ok) throw new Error('fetch failed');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const fetchOrdStats = async (): Promise<{ faces24h: number; plates24h: number }> => {
  const res = await fetch(`${ORD_API}&stats=1`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
};

export const deleteRecognition = async (id: number): Promise<boolean> => {
  const res = await fetch(ORD_API, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.ok;
};

export const photoOf = (d: Recognition): string | undefined =>
  d.type === 'plate' ? d.carImage ?? d.image : d.image;

export const toMapPoints = (list: Recognition[]) =>
  list
    .filter((d) => d.lat !== null && d.lng !== null)
    .map((d) => ({ lat: d.lat as number, lng: d.lng as number, label: d.camera, time: d.time }));
