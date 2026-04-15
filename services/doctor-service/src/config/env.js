import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5002,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};