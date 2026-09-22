import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';

export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  rtsp_login?: string;
  rtsp_password?: string;
  model_id?: number;
  ptz_ip?: string;
  ptz_port?: string;
  ptz_login?: string;
  ptz_password?: string;
  owner?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  territorial_division?: string;
  archive_depth_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CameraModel {
  id: number;
  manufacturer: string;
  model_name: string;
}

export interface Owner {
  id: number;
  name: string;
}

export interface TerritorialDivision {
  id: number;
  name: string;
}

export const CAMERAS_API = `${CAMERAS_SERVICE_API}?resource=registry`;
export const MODELS_API = `${CAMERAS_SERVICE_API}?resource=models`;
export const OWNERS_API = `${CAMERAS_SERVICE_API}?resource=camera-owners`;
export const DIVISIONS_API = `${CAMERAS_SERVICE_API}?resource=territorial-divisions`;