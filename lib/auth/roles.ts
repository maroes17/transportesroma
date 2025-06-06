export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  DRIVER = 'driver',
  DISPATCHER = 'dispatcher'
}

export const RolePermissions = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_roles',
    'view_dashboard',
    'manage_vehicles',
    'manage_routes',
    'view_reports',
    'manage_settings'
  ],
  [UserRole.USER]: [
    'view_profile',
    'edit_profile',
    'view_routes'
  ],
  [UserRole.DRIVER]: [
    'view_profile',
    'edit_profile',
    'view_routes',
    'update_location',
    'view_assignments'
  ],
  [UserRole.DISPATCHER]: [
    'view_profile',
    'edit_profile',
    'view_routes',
    'assign_routes',
    'view_drivers',
    'view_vehicles'
  ]
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return RolePermissions[userRole]?.includes(permission) || false;
};

export const requirePermission = (permission: string) => {
  return (req: Request) => {
    const userRole = req.headers.get('x-user-role') as UserRole;
    if (!userRole || !hasPermission(userRole, permission)) {
      throw new Error('No tienes permiso para realizar esta acción');
    }
  };
}; 