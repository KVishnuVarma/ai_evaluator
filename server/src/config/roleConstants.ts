export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  SPOC: 'spoc',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  [ROLES.ADMIN]: ['manage_users', 'manage_roles', 'view_reports'],
  [ROLES.TEACHER]: ['create_papers', 'grade_papers', 'view_reports'],
  [ROLES.STUDENT]: ['submit_papers', 'view_results'],
  [ROLES.SPOC]: ['manage_students', 'view_reports'],
};
export const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  JWT_ISSUER: process.env.JWT_ISSUER || 'default_issuer',
};
export const getRolePermissions = (role: RoleType): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};
export const isValidRole = (role: string): role is RoleType => {
  return Object.values(ROLES).includes(role as RoleType);
};
export const hasPermission = (role: RoleType, permission: string): boolean => {
  return getRolePermissions(role).includes(permission);
};
export const getAllRoles = (): RoleType[] => {
  return Object.values(ROLES) as RoleType[];
};
export const getRoleByName = (name: string): RoleType | null => {
  return isValidRole(name) ? (name as RoleType) : null;
};
export const getRoleDisplayName = (role: RoleType): string => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.TEACHER:
      return 'Teacher';
    case ROLES.STUDENT:
      return 'Student';
    case ROLES.SPOC:
      return 'Single Point of Contact';
    default:
      return 'Unknown Role';
  }
};
export const getRoleDescription = (role: RoleType): string => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Has full access to manage the system and users.';
    case ROLES.TEACHER:
      return 'Can create and grade papers, and view reports.';
    case ROLES.STUDENT:
      return 'Can submit papers and view their results.';
    case ROLES.SPOC:
      return 'Manages students and views reports.';
    default:
      return 'No description available.';
  }
};
export const getRolePermissionsList = (role: RoleType): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};
export const isRoleAdmin = (role: RoleType): boolean => {
  return role === ROLES.ADMIN;
};
export const isRoleTeacher = (role: RoleType): boolean => {
  return role === ROLES.TEACHER;
};
export const isRoleStudent = (role: RoleType): boolean => {
  return role === ROLES.STUDENT;
};
export const isRoleSPOC = (role: RoleType): boolean => {
  return role === ROLES.SPOC;
};
export const getRoleById = (id: string): RoleType | null => {
  const role = Object.values(ROLES).find((role) => role === id);
  return role ? (role as RoleType) : null;
};
export const getRoleByDisplayName = (displayName: string): RoleType | null => {
  const role = Object.entries(ROLES).find(
    ([, value]) => getRoleDisplayName(value as RoleType) === displayName
  );
  return role ? (role[1] as RoleType) : null;
};
export const getRoleByDescription = (description: string): RoleType | null => {
  const role = Object.entries(ROLES).find(
    ([, value]) => getRoleDescription(value as RoleType) === description
  );
  return role ? (role[1] as RoleType) : null;
};
export const getRolePermissionsByName = (name: string): string[] | null => {
  const role = getRoleByName(name);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsById = (id: string): string[] | null => {
  const role = getRoleById(id);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByDisplayName = (displayName: string): string[] | null => {
  const role = getRoleByDisplayName(displayName);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByDescription = (description: string): string[] | null => {
  const role = getRoleByDescription(description);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByRole = (role: RoleType): string[] => {
  return getRolePermissions(role);
};
export const getRolePermissionsListByRole = (role: RoleType): string[] => {
  return getRolePermissions(role);
};
export const getRolePermissionsListByName = (name: string): string[] | null => {
  const role = getRoleByName(name);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsListById = (id: string): string[] | null => {
  const role = getRoleById(id);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsListByDisplayName = (displayName: string): string[] | null => {
  const role = getRoleByDisplayName(displayName);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsListByDescription = (description: string): string[] | null => {
  const role = getRoleByDescription(description);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByRoleName = (roleName: string): string[] | null => {
  const role = getRoleByName(roleName);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByRoleId = (roleId: string): string[] | null => {
  const role = getRoleById(roleId);
  return role ? getRolePermissions(role) : null;
};
export const getRolePermissionsByRoleDisplayName = (roleDisplayName: string): string[] | null => {
  const role = getRoleByDisplayName(roleDisplayName);
  return role ? getRolePermissions(role) : null;
};
