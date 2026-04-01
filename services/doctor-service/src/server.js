import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Doctor service running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start doctor service:", error.message);
    process.exit(1);
  }
};

startServer();