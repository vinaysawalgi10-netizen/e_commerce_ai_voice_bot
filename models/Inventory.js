import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  productId: String,
  productName: String,
  stock: Number,
  price: Number
});

export default mongoose.model("Inventory", inventorySchema);