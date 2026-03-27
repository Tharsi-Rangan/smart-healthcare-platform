import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const userId = decoded.userId;
    const role = decoded.role;

    if (!userId || !role) {
      return next(new AppError("Invalid token payload", 401));
    }

    req.user = {
      id: String(userId),
      role: String(role),
    };
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }

  next();
};
