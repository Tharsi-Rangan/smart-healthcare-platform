import cors from "cors";
import express from "express";
import appointmentRoutes from "./routes/appointment.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Appointment service running",
    data: null,
  });
});

app.use("/api/appointments", appointmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
