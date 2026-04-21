import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5006,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};