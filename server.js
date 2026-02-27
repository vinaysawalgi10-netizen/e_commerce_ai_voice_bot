import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import webhookRoute from "./routes/webhook.js";

dotenv.config();

const app = express();

// Safe check for environment variables (won't crash app)
if (!process.env.MONGO_URI) {
  console.log("⚠️ Missing MONGO_URI");
}
if (!process.env.RETELL_SECRET) {
  console.log("⚠️ Missing RETELL_SECRET");
}

// Enable CORS
app.use(cors());

// Health check route BEFORE any body parsing
app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("MARU Running");
});

// Webhook needs raw body for signature verification
app.use("/webhook", express.raw({ type: "application/json" }), webhookRoute);

// Simple webhook test route
app.post("/webhook-test", (req, res) => {
  res.send("Webhook Working");
});

// Connect to MongoDB with error handling
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
