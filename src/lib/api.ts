const CAMERAS_API = 'https://functions.poehali.dev/a2915cca-0478-407a-8a11-b2f1ed8d3b0e';
const STATS_API = 'https://functions.poehali.dev/493b6ec7-24af-42b5-993a-00cb298c4ef7';

export interface Camera {
  id: number;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'problem';
  owner: string;
  group: string;
  lat: string | number;
  lng: string | number;
  resolution: string;
  fps: number;
  traffic: string | number;
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
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.owner && filters.owner !== 'all') {
      params.append('owner', filters.owner);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const url = `${CAMERAS_API}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch cameras');
    }
    const data = await response.json();
    return data.map((camera: Camera) => ({
      ...camera,
      lat: typeof camera.lat === 'string' ? parseFloat(camera.lat) : camera.lat,
      lng: typeof camera.lng === 'string' ? parseFloat(camera.lng) : camera.lng,
      traffic: typeof camera.traffic === 'string' ? parseFloat(camera.traffic) : camera.traffic,
    }));
  },

  async getCameraById(id: number): Promise<Camera> {
    const response = await fetch(`${CAMERAS_API}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch camera');
    }
    const data = await response.json();
    return {
      ...data,
      lat: typeof data.lat === 'string' ? parseFloat(data.lat) : data.lat,
      lng: typeof data.lng === 'string' ? parseFloat(data.lng) : data.lng,
      traffic: typeof data.traffic === 'string' ? parseFloat(data.traffic) : data.traffic,
    };
  },

  async createCamera(camera: Omit<Camera, 'id' | 'created_at' | 'updated_at'>): Promise<Camera> {
    const response = await fetch(CAMERAS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(camera),
    });
    if (!response.ok) {
      throw new Error('Failed to create camera');
    }
    return response.json();
  },

  async updateCamera(id: number, updates: Partial<Camera>): Promise<Camera> {
    const response = await fetch(CAMERAS_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!response.ok) {
      throw new Error('Failed to update camera');
    }
    return response.json();
  },

  async deleteCamera(id: number): Promise<void> {
    const response = await fetch(`${CAMERAS_API}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete camera');
    }
  },

  async getStats(): Promise<CameraStats> {
    const response = await fetch(STATS_API);
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return response.json();
  },
};
