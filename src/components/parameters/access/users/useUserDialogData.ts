import { useState, useEffect } from 'react';
import { Role, UserGroup, CameraGroup, ROLES_API, USER_GROUPS_API, CAMERA_GROUPS_API } from './userDialogTypes';

export const useUserDialogData = (open: boolean) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [cameraGroups, setCameraGroups] = useState<CameraGroup[]>([]);

  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchUserGroups();
      fetchCameraGroups();
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(ROLES_API);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(USER_GROUPS_API);
      if (response.ok) {
        const data = await response.json();
        console.log('User groups loaded:', data);
        setUserGroups(data);
      } else {
        console.error('Failed to fetch user groups, status:', response.status);
        setUserGroups([
          { id: 1, name: 'Администраторы' },
          { id: 2, name: 'Операторы' },
          { id: 3, name: 'Служба безопасности' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setUserGroups([
        { id: 1, name: 'Администраторы' },
        { id: 2, name: 'Операторы' },
        { id: 3, name: 'Служба безопасности' }
      ]);
    }
  };

  const fetchCameraGroups = async () => {
    try {
      const response = await fetch(CAMERA_GROUPS_API);
      if (response.ok) {
        const data = await response.json();
        console.log('Camera groups loaded:', data);
        setCameraGroups(data);
      } else {
        console.error('Failed to fetch camera groups, status:', response.status);
        setCameraGroups([
          { id: 1, name: 'Все камеры' },
          { id: 2, name: 'Входные группы' },
          { id: 3, name: 'Парковки' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching camera groups:', error);
      setCameraGroups([
        { id: 1, name: 'Все камеры' },
        { id: 2, name: 'Входные группы' },
        { id: 3, name: 'Парковки' }
      ]);
    }
  };

  return { roles, userGroups, cameraGroups };
};
