import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

export const protect = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  console.log("authorization header:", authorizationHeader);
  console.log("doctor-service jwt secret:", env.jwtSecret);

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required", 401));
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    console.log("decoded token:", decoded);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log("jwt verify error:", error.message);
    next(new AppError("Invalid or expired token", 401));
  }
};