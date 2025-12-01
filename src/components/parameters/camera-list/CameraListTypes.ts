export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  rtsp_login?: string;
  rtsp_password?: string;
  model_id?: number;
  manufacturer?: string;
  model_name?: string;
  owner: string;
  address: string;
  latitude?: number;
  longitude?: number;
  territorial_division: string;
  archive_depth_days: number;
  status: string;
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

export const CAMERAS_API = 'https://functions.poehali.dev/dab3e8e4-48b1-43e8-bcfa-a4e01a88a3ca';
export const MODELS_API = 'https://functions.poehali.dev/eda42008-a331-424c-9f91-c486dddbf171';
export const OWNERS_API = 'https://functions.poehali.dev/68541727-184f-48a2-8204-4750decd7641';
export const DIVISIONS_API = 'https://functions.poehali.dev/d5a6cdfb-9846-4e82-a073-4a9fe43fe2a8';
