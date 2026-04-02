const { sendError } = require("../utils/apiResponse");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 401, "Not authorized.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden. You do not have access to this resource.");
    }

    next();
  };
};

module.exports = {
  authorize,
};