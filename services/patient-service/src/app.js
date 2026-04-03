const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/healthRoutes");
const patientProfileRoutes = require("./routes/patientProfileRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const patientReportRoutes = require("./routes/patientReportRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/health", healthRoutes);
app.use("/api/patients", patientProfileRoutes);
app.use("/api/patients/medical-history", medicalHistoryRoutes);
app.use("/api/patients/reports", patientReportRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: [],
  });
});

app.use(errorHandler);

module.exports = app;