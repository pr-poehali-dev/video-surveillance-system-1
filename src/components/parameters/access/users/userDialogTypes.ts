export interface User {
  id: number;
  full_name: string;
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

export const USERS_API = 'https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f';
export const ROLES_API = 'https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b';
export const USER_GROUPS_API = 'https://functions.poehali.dev/8e8951a5-c686-4bb1-946c-23f7d5a82d44';
export const CAMERA_GROUPS_API = 'https://functions.poehali.dev/90109919-f443-4ada-9135-696710aa2338';

export const COMPANIES = [
  'МВД',
  'Администрация',
  'ФСБ',
  'Росгвардия',
  'МЧС',
  'Прокуратура',
  'Следственный комитет'
];
