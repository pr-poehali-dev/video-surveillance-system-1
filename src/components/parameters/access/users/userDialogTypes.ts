import { USERS_SERVICE_API, CAMERAS_SERVICE_API } from '@/lib/backendUrls';

export interface User {
  id: number;
  full_name: string;
  position?: string;
  email: string;
  login: string;
  company?: string;
  role_id?: number;
  role_name?: string;
  user_group_id?: number;
  user_group_name?: string;
  camera_group_id?: number;
  camera_group_name?: string;
  work_phone?: string;
  mobile_phone?: string;
  note?: string;
  attached_files?: string[];
  is_online: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface UserGroup {
  id: number;
  name: string;
}

export interface CameraGroup {
  id: number;
  name: string;
}

export interface UserFormData {
  full_name: string;
  position: string;
  email: string;
  login: string;
  password: string;
  company: string;
  role_id: string;
  user_group_id: string;
  camera_group_id: string;
  work_phone: string;
  mobile_phone: string;
  note: string;
}

export const USERS_API = `${USERS_SERVICE_API}?resource=users`;
export const ROLES_API = `${USERS_SERVICE_API}?resource=roles`;
export const USER_GROUPS_API = `${USERS_SERVICE_API}?resource=user-groups`;
export const CAMERA_GROUPS_API = `${CAMERAS_SERVICE_API}?resource=camera-groups`;

export const COMPANIES = [
  'МВД',
  'Администрация',
  'ФСБ',
  'Росгвардия',
  'МЧС',
  'Прокуратура',
  'Следственный комитет'
];