import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";
import Inventory from "./models/Inventory.js";

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB for seeding");

        // Seed Order
        const orderId = "ORD1001";
        await Order.findOneAndUpdate(
            { orderId },
            {
                orderId,
                customerPhone: "1234567890",
                status: "Out for Delivery",
                eta: "Tomorrow",
                amount: 2500,
                paymentStatus: "Paid",
                refundStatus: "Not Initiated"
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Order ${orderId} seeded`);

        // Seed Product
        const productId = "P100";
        await Inventory.findOneAndUpdate(
            { productId },
            {
                productId,
                productName: "Premium Wireless Headphones",
                stock: 15,
                price: 4999
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Product ${productId} seeded`);

        console.log("🎯 Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
