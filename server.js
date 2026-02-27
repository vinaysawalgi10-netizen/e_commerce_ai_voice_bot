import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import webhookRoute from "./routes/webhook.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Safe check for environment variables
const MONGO_URI = process.env.MONGO_URI;
const RETELL_SECRET = process.env.RETELL_SECRET;

if (!MONGO_URI) {
  console.log("⚠️ Missing MONGO_URI - using local fallback");
}
if (!RETELL_SECRET) {
  console.log("⚠️ Missing RETELL_SECRET");
}

// Enable CORS
app.use(cors());

// Health check route - Railway prefers JSON
app.get("/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus
  });
});

app.get("/", (req, res) => {
  res.send("E-commerce Voice AI Bot Running");
});

// Webhook needs raw body for signature verification
app.use("/webhook", express.raw({ type: "application/json" }), webhookRoute);

// Simple webhook test route
app.post("/webhook-test", (req, res) => {
  res.send("Webhook Working");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to MongoDB with retry logic
const connectWithRetry = ( retries = 5, delay = 5000 ) => {
  mongoose.connect(MONGO_URI || "mongodb://localhost:27017/ecommerce")
    .then(() => {
      console.log("✅ MongoDB Connected");
    })
    .catch(err => {
      console.error("❌ MongoDB Error:", err.message);
      if (retries > 0) {
        console.log(`🔄 Retrying MongoDB connection in ${delay/1000}s... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
        console.log("❌ MongoDB connection failed after all retries");
      }
    });
};

// Start MongoDB connection
connectWithRetry();

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Server closed");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
