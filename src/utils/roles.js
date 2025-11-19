// Role utilities for multi-user system (SuperAdmin, Admin, SubAdmin)
export const ROLES = {
  SUPERADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  SUBADMIN: 'SubAdmin'
}

export const ROLE_HIERARCHY = {
  [ROLES.SUPERADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.SUBADMIN]: 1
}

export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role)
}

export const normalizeRole = (role) => {
  if (!role) return ROLES.ADMIN
  
  const roleLower = role.toLowerCase()
  if (roleLower.includes('super')) return ROLES.SUPERADMIN
  if (roleLower.includes('sub')) return ROLES.SUBADMIN
  return ROLES.ADMIN
}

export const hasPermission = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

