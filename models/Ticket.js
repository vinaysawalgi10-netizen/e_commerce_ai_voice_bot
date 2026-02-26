import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  customerPhone: String,
  issue: String,
  priority: String,
  status: { type: String, default: "Open" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ticket", ticketSchema);