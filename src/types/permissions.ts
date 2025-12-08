export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'view_archive' | 'view_online' | 'ptz_control' | 'camera_settings';

export interface Permission {
  resource: string;
  actions: PermissionAction[];
}

export interface RolePermissions {
  home: {
    view: boolean;
  };
  monitoring: {
    view: boolean;
    view_online: boolean;
    view_archive: boolean;
    ptz_control: boolean;
  };
  ord: {
    view: boolean;
    online_search: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    online_search_license_plate: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    historical_search_faces: {
      view: boolean;
    };
    historical_search_license_plates: {
      view: boolean;
    };
  };
  layouts: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    camera_settings: boolean;
  };
  reports: {
    view: boolean;
  };
  photo_archive: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  parameters: {
    view: boolean;
    access_management: {
      view: boolean;
      roles: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      users: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      user_groups: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      sessions: {
        view: boolean;
      };
      audit_log: {
        view: boolean;
      };
    };
    camera_sources: {
      view: boolean;
      cameras: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      camera_groups: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      owners_registry: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      tags: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
      camera_models: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
      };
    };
    territorial_divisions: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    trash: {
      view: boolean;
    };
    vvs: {
      view: boolean;
    };
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermissions;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PERMISSIONS: RolePermissions = {
  home: { view: false },
  monitoring: {
    view: false,
    view_online: false,
    view_archive: false,
    ptz_control: false,
  },
  ord: {
    view: false,
    online_search: { view: false, create: false, edit: false, delete: false },
    online_search_license_plate: { view: false, create: false, edit: false, delete: false },
    historical_search_faces: { view: false },
    historical_search_license_plates: { view: false },
  },
  layouts: {
    view: false,
    create: false,
    edit: false,
    delete: false,
    camera_settings: false,
  },
  reports: { view: false },
  photo_archive: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  parameters: {
    view: false,
    access_management: {
      view: false,
      roles: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      user_groups: { view: false, create: false, edit: false, delete: false },
      sessions: { view: false },
      audit_log: { view: false },
    },
    camera_sources: {
      view: false,
      cameras: { view: false, create: false, edit: false, delete: false },
      camera_groups: { view: false, create: false, edit: false, delete: false },
      owners_registry: { view: false, create: false, edit: false, delete: false },
      tags: { view: false, create: false, edit: false, delete: false },
      camera_models: { view: false, create: false, edit: false, delete: false },
    },
    territorial_divisions: { view: false, create: false, edit: false, delete: false },
    trash: { view: false },
    vvs: { view: false },
  },
};
