import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Auth service running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start auth service:", error.message);
    process.exit(1);
  }
};

startServer();