const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const healthRoutes = require("./routes/healthRoutes");
const patientProfileRoutes = require("./routes/patientProfileRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const patientReportRoutes = require("./routes/patientReportRoutes");
const patientSummaryRoutes = require("./routes/patientSummaryRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/health", healthRoutes);
app.get("/api/patients/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Patient service is running",
    data: {
      service: "patient-service",
      status: "ok",
    },
  });
});
app.use("/api/patients/medical-history", medicalHistoryRoutes);
app.use("/api/patients/reports", patientReportRoutes);
app.use("/api/patients/summary", patientSummaryRoutes);
app.use("/api/patients", patientProfileRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: [],
  });
});

app.use(errorHandler);

module.exports = app;