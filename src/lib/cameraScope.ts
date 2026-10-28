import { CAMERAS_SERVICE_API } from '@/lib/backendUrls';

export const getScopedCamerasUrl = () => {
  const base = `${CAMERAS_SERVICE_API}?resource=registry`;
  const groupId = typeof window !== 'undefined' ? localStorage.getItem('cameraGroupId') : null;
  return `${base}&camera_group_id=${groupId || 0}`;
};
