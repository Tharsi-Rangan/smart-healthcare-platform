import jwt from "jsonwebtoken";
import config from "../config/env.js";
import AppError from "../utils/appError.js";

export const verifyToken = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(new AppError("No token provided", 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid token", 401));
  }
};

export const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
};
