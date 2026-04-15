import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Appointment service running on port ${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down appointment service...`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start appointment service:", error.message);
    process.exit(1);
  }
};

startServer();