const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Patient service is running",
    data: {
      service: "patient-service",
      status: "ok",
    },
  });
});

module.exports = router;