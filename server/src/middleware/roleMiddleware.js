import { USER_ROLES } from '../constant/index.js';

/**
 * Role-Based Access Control Middleware
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied: User role unverified.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is unauthorized to perform this health operation. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

export const isOfficerOrAdmin = requireRoles(USER_ROLES.HEALTH_OFFICER, USER_ROLES.ADMINISTRATOR);
export const isAdminOnly = requireRoles(USER_ROLES.ADMINISTRATOR);
