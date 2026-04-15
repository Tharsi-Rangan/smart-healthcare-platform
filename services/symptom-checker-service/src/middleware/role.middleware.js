import { AppError } from "../utils/appError.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};