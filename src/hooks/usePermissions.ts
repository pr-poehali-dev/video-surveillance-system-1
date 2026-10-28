import { useState, useEffect, useCallback } from 'react';
import { USERS_SERVICE_API } from '@/lib/backendUrls';

interface Permissions {
  home?: boolean;
  monitoring?: boolean;
  ord?: boolean;
  layouts?: boolean;
  photoArchive?: boolean;
  reports?: boolean;
  parameters?: boolean;
  viss?: boolean;
  cameraRegistry?: boolean;
}

const PATH_PERMISSION: Record<string, keyof Permissions> = {
  '/dashboard': 'home',
  '/monitoring': 'monitoring',
  '/ord': 'ord',
  '/layouts': 'layouts',
  '/photo-archive': 'photoArchive',
  '/reports': 'reports',
  '/parameters': 'parameters',
  '/viss': 'viss',
  '/camera-registry': 'cameraRegistry',
};

const ORDERED_PATHS = [
  '/dashboard',
  '/monitoring',
  '/ord',
  '/layouts',
  '/photo-archive',
  '/reports',
  '/parameters',
  '/viss',
  '/camera-registry',
];

interface RawPermissions {
  home?: { view?: boolean };
  monitoring?: { view?: boolean };
  ord?: { view?: boolean };
  layouts?: { view?: boolean };
  photo_archive?: { view?: boolean };
  reports?: { view?: boolean };
  parameters?: {
    view?: boolean;
    vvs?: { view?: boolean };
    camera_sources?: { view?: boolean };
  };
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const roleId = localStorage.getItem('userRoleId');
        if (!roleId) {
          setHasRole(false);
          return;
        }
        setHasRole(true);

        const response = await fetch(`${USERS_SERVICE_API}?resource=roles&id=${roleId}`);
        if (!response.ok) {
          setPermissions({});
          return;
        }
        const role = await response.json();
        const raw: RawPermissions = role.permissions || {};

        setPermissions({
          home: raw.home?.view === true,
          monitoring: raw.monitoring?.view === true,
          ord: raw.ord?.view === true,
          layouts: raw.layouts?.view === true,
          photoArchive: raw.photo_archive?.view === true,
          reports: raw.reports?.view === true,
          parameters: raw.parameters?.view === true,
          viss: raw.parameters?.vvs?.view === true,
          cameraRegistry: raw.parameters?.camera_sources?.view === true,
        });
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const canAccess = useCallback(
    (path: string) => {
      if (!hasRole) return true;
      const key = PATH_PERMISSION[path];
      if (!key) return true;
      return permissions[key] === true;
    },
    [hasRole, permissions]
  );

  const firstAllowedPath = ORDERED_PATHS.find((p) => canAccess(p)) ?? null;

  return { permissions, loading, hasRole, canAccess, firstAllowedPath };
};
