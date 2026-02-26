require("dotenv").config();
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import webhookRoute from "./routes/webhook.js";

const app = express();

// Safe check for environment variables (won't crash app)
if (!process.env.MONGO_URI) {
  console.log("⚠️ Missing MONGO_URI");
}
if (!process.env.RETELL_SECRET) {
  console.log("⚠️ Missing RETELL_SECRET");
}

app.use(cors());
app.use(express.json());

// Connect to MongoDB with error handling
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

// Routes
app.use("/webhook", webhookRoute);

// Simple webhook test route (for 502 fix)
app.post("/webhook-test", (req, res) => {
  res.send("Webhook Working");
});

app.get("/", (req, res) => {
  res.send("MARU Running");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
