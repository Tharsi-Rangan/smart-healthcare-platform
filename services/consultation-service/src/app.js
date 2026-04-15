import express from "express";
import cors from "cors";
import consultationRoutes from "./routes/consultation.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Consultation service is running",
  });
});

app.use("/api/consultations", consultationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
