import express from "express";
import cors from "cors";
import doctorRoutes from "./routes/doctor.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor service is running",
  });
});

app.use("/api/doctors", doctorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;