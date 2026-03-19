// middleware/roleAuth.js
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user exists (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    // 2. Check if the user's role is in the allowed list
    // Assuming your JWT payload has 'role' (e.g., 'admin', 'security', 'visitor')
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: ${req.user.role} does not have access to this action` 
      });
    }

    // 3. Everything is fine, move to the controller
    next();
  };
};

module.exports = authorize;