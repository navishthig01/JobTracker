const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Job = require("../server/models/job");

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;

  console.log("MongoDB connected successfully");
}

app.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    res.json({
      message: "JobTrack API is running!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/jobs", async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

const jobRoutes = require("../server/routes/jobroutes");

app.use("/api/jobs", jobRoutes);

module.exports = app;