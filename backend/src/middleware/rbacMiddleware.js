/**
 * Role-Based Access Control (RBAC) Middleware
 */

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User context missing.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have access. Required: [${roles.join(', ')}]`
      });
    }

    next();
  };
}

/**
 * Enforces cooperative society tenancy scope
 */
export function enforceCooperativeScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  // If Cooperative Admin, ensure they only access their cooperative's records
  if (req.user.role === 'COOPERATIVE_ADMIN') {
    req.cooperativeScope = { cooperativeId: req.user.cooperativeId };
  } else {
    // Federation Admin / System Admin can access all or specify via query param
    req.cooperativeScope = req.query.cooperativeId ? { cooperativeId: req.query.cooperativeId } : {};
  }

  next();
}
