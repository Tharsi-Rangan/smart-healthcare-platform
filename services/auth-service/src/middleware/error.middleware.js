import { AppError } from "../utils/appError.js";

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const errors = error.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};