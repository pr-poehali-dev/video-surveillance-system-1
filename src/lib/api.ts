const CAMERAS_API = 'https://functions.poehali.dev/712d5c60-998d-49d9-8252-705500df28c7';
const STATS_API = 'https://functions.poehali.dev/493b6ec7-24af-42b5-993a-00cb298c4ef7';

export interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  owner: string;
  group: string;
  lat: number;
  lng: number;
  resolution: string;
  fps: number;
  traffic: string | number;
  rtsp_url?: string;
  hls_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CameraStats {
  total: number;
  active: number;
  inactive: number;
  problem: number;
  total_traffic: number;
  avg_fps: number;
  by_owner: Array<{ owner: string; count: number }>;
  by_group: Array<{ group: string; count: number }>;
}

export interface CameraFilters {
  status?: string;
  owner?: string;
  search?: string;
}

export const api = {
  async getCameras(filters?: CameraFilters): Promise<Camera[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.owner && filters.owner !== 'all') params.append('owner', filters.owner);
    if (filters?.search) params.append('search', filters.search);

    const url = `${CAMERAS_API}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cameras');
    const data = await response.json();

    return data.map((cam: Record<string, unknown>) => ({
      id: cam['id'],
      name: cam['name'] || '',
      address: cam['address'] || '',
      status: (cam['status'] as string) || 'active',
      owner: cam['owner'] || '',
      group: cam['group'] || cam['territorial_division'] || '',
      lat: cam['latitude'] != null ? parseFloat(String(cam['latitude'])) : (cam['lat'] != null ? parseFloat(String(cam['lat'])) : 0),
      lng: cam['longitude'] != null ? parseFloat(String(cam['longitude'])) : (cam['lng'] != null ? parseFloat(String(cam['lng'])) : 0),
      resolution: (cam['resolution'] as string) || '',
      fps: cam['fps'] ? parseFloat(String(cam['fps'])) : 0,
      traffic: cam['traffic'] ? parseFloat(String(cam['traffic'])) : 0,
      rtsp_url: (cam['rtsp_url'] as string) || undefined,
      hls_url: (cam['hls_url'] as string) || undefined,
      created_at: cam['created_at'] as string | undefined,
      updated_at: cam['updated_at'] as string | undefined,
    }));
  },

  async getCameraById(id: number): Promise<Camera> {
    const response = await fetch(`${CAMERAS_API}?id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch camera');
    const cam = await response.json();
    return {
      id: cam.id,
      name: cam.name || '',
      address: cam.address || '',
      status: cam.status || 'active',
      owner: cam.owner || '',
      group: cam.group || cam.territorial_division || '',
      lat: cam.latitude != null ? parseFloat(cam.latitude) : (cam.lat != null ? parseFloat(cam.lat) : 0),
      lng: cam.longitude != null ? parseFloat(cam.longitude) : (cam.lng != null ? parseFloat(cam.lng) : 0),
      resolution: cam.resolution || '',
      fps: cam.fps ? parseFloat(cam.fps) : 0,
      traffic: cam.traffic ? parseFloat(cam.traffic) : 0,
      rtsp_url: cam.rtsp_url || undefined,
      hls_url: cam.hls_url || undefined,
    };
  },

  async createCamera(camera: Omit<Camera, 'id' | 'created_at' | 'updated_at'>): Promise<Camera> {
    const response = await fetch(CAMERAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camera),
    });
    if (!response.ok) throw new Error('Failed to create camera');
    return response.json();
  },

  async updateCamera(id: number, updates: Partial<Camera>): Promise<Camera> {
    const response = await fetch(CAMERAS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!response.ok) throw new Error('Failed to update camera');
    return response.json();
  },

  async deleteCamera(id: number): Promise<void> {
    const response = await fetch(`${CAMERAS_API}?id=${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete camera');
  },

  async getStats(): Promise<CameraStats> {
    const response = await fetch(STATS_API);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },
};
