export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role || req.user?.user_type;   // ← added fallback

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
