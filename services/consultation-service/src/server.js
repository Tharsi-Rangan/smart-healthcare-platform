import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import config from "./config/env.js";

dotenv.config();

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Consultation service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start consultation service:", error);
    process.exit(1);
  }
};

startServer();
