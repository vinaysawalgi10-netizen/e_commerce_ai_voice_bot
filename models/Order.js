import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerPhone: { type: String, required: true },

  status: {
    type: String,
    enum: ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Processing"
  },

  eta: String,
  amount: Number,

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending"
  },

  trackingId: String,

  refundStatus: {
    type: String,
    enum: ["Not Initiated", "Processing", "Completed"],
    default: "Not Initiated"
  },

  refundAmount: Number,

  returnRequested: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Order", orderSchema);