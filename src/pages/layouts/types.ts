export interface LayoutConfig {
  id: number;
  name: string;
  grid: number;
  cameras: number[];
  hideInactive?: boolean;
  hideProblem?: boolean;
  showLabels?: boolean;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export interface SystemUser {
  id: number;
  login: string;
  full_name: string;
}

export interface SharedUser {
  user: SystemUser;
  canView: boolean;
  canEdit: boolean;
}

export interface CameraItem {
  id: number;
  name: string;
  address: string;
  status: string;
}

export interface GridOption {
  value: string;
  label: string;
  cols: number;
  rows: number;
}

export const USERS_API = 'https://functions.poehali.dev/3d76631a-e593-4962-9622-38e3a61e112f';

export const GRID_OPTIONS: GridOption[] = [
  { value: '1', label: '1 камера', cols: 1, rows: 1 },
  { value: '2', label: '2 камеры', cols: 2, rows: 1 },
  { value: '4', label: '4 камеры', cols: 2, rows: 2 },
  { value: '6', label: '6 камер', cols: 3, rows: 2 },
  { value: '9', label: '9 камер', cols: 3, rows: 3 },
  { value: '12', label: '12 камер', cols: 4, rows: 3 },
];

export const CAMERAS_LIST: CameraItem[] = [
  { id: 1, name: 'Камера-001', address: 'ул. Ленина, 50', status: 'active' },
  { id: 2, name: 'Камера-002', address: 'ул. Монастырская, 12', status: 'active' },
  { id: 3, name: 'Камера-003', address: 'ул. Сибирская, 27', status: 'problem' },
  { id: 4, name: 'Камера-004', address: 'Комсомольский пр., 68', status: 'active' },
  { id: 5, name: 'Камера-005', address: 'ул. Петропавловская, 35', status: 'inactive' },
  { id: 6, name: 'Камера-006', address: 'ул. Куйбышева, 95', status: 'active' },
  { id: 7, name: 'Камера-007', address: 'ул. Пушкина, 15', status: 'active' },
  { id: 8, name: 'Камера-008', address: 'ул. Крупской, 82', status: 'active' },
  { id: 9, name: 'Камера-009', address: 'ул. Борчанинова, 23', status: 'active' },
];
