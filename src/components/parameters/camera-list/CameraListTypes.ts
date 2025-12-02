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

export const CAMERAS_API = 'https://functions.poehali.dev/712d5c60-998d-49d9-8252-705500df28c7';
export const MODELS_API = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';
export const OWNERS_API = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';
export const DIVISIONS_API = 'https://functions.poehali.dev/3bde3412-2407-4812-8ba6-c898f9f07674';
