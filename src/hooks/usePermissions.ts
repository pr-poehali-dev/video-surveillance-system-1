import { useState, useEffect } from 'react';

interface Permissions {
  monitoring?: boolean;
  ord?: boolean;
  layouts?: boolean;
  photoArchive?: boolean;
  reports?: boolean;
  parameters?: boolean;
  viss?: boolean;
  cameraRegistry?: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const roleId = user.role_id;

        if (!roleId) {
          setPermissions({});
          setLoading(false);
          return;
        }

        const response = await fetch(`https://functions.poehali.dev/3cded7ed-a0ac-4076-8dcd-56e3c02e6d8e?id=${roleId}`);
        
        if (response.ok) {
          const role = await response.json();
          const rawPermissions = role.permissions || {};
          
          const mappedPermissions: Permissions = {
            monitoring: rawPermissions.monitoring?.view === true,
            ord: rawPermissions.ord?.view === true,
            layouts: rawPermissions.layouts?.view === true,
            photoArchive: rawPermissions.photo_archive?.view === true,
            reports: rawPermissions.reports?.view === true,
            parameters: rawPermissions.parameters?.view === true,
            viss: rawPermissions.parameters?.vvs?.view === true,
            cameraRegistry: rawPermissions.parameters?.camera_sources?.view === true,
          };
          
          setPermissions(mappedPermissions);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading };
};