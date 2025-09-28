// Role utility functions for Yi Farishtey application

// Available roles in the system
export const ROLES = {
  ROLE_DEFAULT: 'ROLE_DEFAULT',
  USER: 'user',
  TRAINER: 'trainer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Get current user role from localStorage
export const getCurrentUserRole = () => {
  return localStorage.getItem('role') || null;
};

// Check if user has a specific role
export const hasRole = (requiredRole) => {
  const userRole = getCurrentUserRole();
  if (!userRole) return false;
  
  // Super admin has access to everything
  if (userRole === ROLES.SUPER_ADMIN) return true;
  
  return userRole === requiredRole;
};

// Check if user has any of the required roles
export const hasAnyRole = (requiredRoles) => {
  const userRole = getCurrentUserRole();
  if (!userRole) return false;
  
  // Super admin has access to everything
  if (userRole === ROLES.SUPER_ADMIN) return true;
  
  return requiredRoles.includes(userRole);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getCurrentUserRole();
};

// Check if user can access approval page (only ROLE_DEFAULT)
export const canAccessApproval = () => {
  return hasRole(ROLES.ROLE_DEFAULT);
};

// Check if user can access admin functions
export const canAccessAdmin = () => {
  return hasAnyRole([ROLES.ROLE_DEFAULT, ROLES.ADMIN, ROLES.SUPER_ADMIN]);
};

// Check if user can access super admin functions
export const canAccessSuperAdmin = () => {
  return hasRole(ROLES.SUPER_ADMIN);
};

// Get user-friendly role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ROLE_DEFAULT]: 'Default User',
    [ROLES.USER]: 'User',
    [ROLES.TRAINER]: 'Trainer',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.SUPER_ADMIN]: 'Super Admin'
  };
  
  return roleNames[role] || role;
};

// Logout user and clear role
export const logout = () => {
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  window.location.href = '/signin';
};
