import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import webhookRoute from "./routes/webhook.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo Connected"))
  .catch(err => console.error(err));

app.use("/webhook", webhookRoute);

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