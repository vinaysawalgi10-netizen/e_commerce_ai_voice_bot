import express from "express";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    // Security check
    if (req.headers["x-api-key"] !== process.env.RETELL_SECRET) {
      return res.status(403).send("Unauthorized");
    }

    console.log("Full Incoming Body:", JSON.stringify(req.body, null, 2));

    // Detect tool name
    let tool = req.body.tool || req.body.name || (req.body.call && req.body.call.tool_name);

    // Extract data/parameters robustly
    let data = {};

    if (req.body.data) data = req.body.data;
    else if (req.body.args) data = req.body.args;
    else if (req.body.parameters) data = req.body.parameters;
    else if (req.body.arguments) data = req.body.arguments;
    else if (req.body.call && req.body.call.arguments) data = req.body.call.arguments;
    else data = req.body;

    console.log(`Detected tool: ${tool}`);
    console.log("Extracted data:", data);

    // -------------------------
    // ORDER STATUS
    // -------------------------

    if (tool === "get_order_status") {
      let orderId =
        data.order_id ||
        data.orderId ||
        data.order ||
        data.id ||
        (typeof data === "string" ? data : null);

      if (!orderId) {
        return res.json({ response: "Please provide an order ID." });
      }

      // Normalize Case and remove spaces (handles voice transcription nuances)
      const cleanedOrderId = orderId.toString().replace(/\s+/g, '').toUpperCase();
      console.log(`Searching for Order ID: original="${orderId}", cleaned="${cleanedOrderId}"`);

      const order = await Order.findOne({
        $or: [
          { orderId: cleanedOrderId },
          { orderId: orderId } // fallback to original
        ]
      });

      if (!order) {
        return res.json({
          response: `I couldn't find an order with the ID ${orderId}. Could you please double-check it?`
        });
      }

      return res.json({
        response: `Your order is ${order.status} and will arrive by ${order.eta}.`
      });
    }

    // -------------------------
    // CANCEL ORDER
    // -------------------------

    if (tool === "cancel_order") {
      let orderId =
        data.order_id ||
        data.orderId ||
        data.order ||
        data.id ||
        (typeof data === "string" ? data : null);
      if (!orderId) return res.json({ response: "Please provide an order ID." });

      const cleanedOrderId = orderId.toString().replace(/\s+/g, '').toUpperCase();
      console.log(`Cancelling Order ID: original="${orderId}", cleaned="${cleanedOrderId}"`);

      const order = await Order.findOne({
        $or: [{ orderId: cleanedOrderId }, { orderId: orderId }]
      });

      if (!order) {
        return res.json({ response: `I couldn't find an order with the ID ${orderId}.` });
      }

      order.status = "Cancelled";
      await order.save();

      return res.json({ response: "Your order has been successfully cancelled." });
    }

    // -------------------------
    // REFUND STATUS
    // -------------------------

    if (tool === "get_refund_status") {
      let orderId =
        data.order_id ||
        data.orderId ||
        data.order ||
        data.id ||
        (typeof data === "string" ? data : null);
      if (!orderId) return res.json({ response: "Please provide an order ID." });

      const cleanedOrderId = orderId.toString().replace(/\s+/g, '').toUpperCase();
      console.log(`Refund Check for Order ID: original="${orderId}", cleaned="${cleanedOrderId}"`);

      const order = await Order.findOne({
        $or: [{ orderId: cleanedOrderId }, { orderId: orderId }]
      });

      if (!order) {
        return res.json({ response: `I couldn't find an order with the ID ${orderId}.` });
      }

      return res.json({ response: `Refund status for order ${orderId} is ${order.refundStatus || "Not initiated"}.` });
    }

    // -------------------------
    // INVENTORY
    // -------------------------

    if (tool === "check_inventory") {
      let productId =
        data.product_id ||
        data.productId ||
        data.product ||
        data.id ||
        (typeof data === "string" ? data : null);
      if (!productId) return res.json({ response: "Please provide a product ID." });

      const cleanedProductId = productId.toString().replace(/\s+/g, '').toUpperCase();
      console.log(`Checking Inventory for Product ID: original="${productId}", cleaned="${cleanedProductId}"`);

      const product = await Inventory.findOne({
        $or: [{ productId: cleanedProductId }, { productId: productId }]
      });

      if (!product) {
        return res.json({ response: `I couldn't find a product with the ID ${productId}.` });
      }

      return res.json({
        response: product.stock > 0
          ? `${product.productName} is available in stock. We have ${product.stock} units left.`
          : `${product.productName} is currently out of stock.`
      });
    }

    // -------------------------
    // CREATE TICKET
    // -------------------------

    if (tool === "create_ticket") {

      const ticket = await Ticket.create({
        customerPhone: data.phone,
        issue: data.issue,
        priority: "Medium"
      });

      return res.json({
        response: `Your complaint has been registered. Ticket ID is ${ticket._id}.`
      });

    }

    // -------------------------
    // TRACKING STATUS
    // -------------------------

    if (tool === "get_tracking_status") {

      let trackingId =
        data.tracking_id ||
        data.trackingId ||
        data.id;

      if (!trackingId) {
        return res.json({
          success: false,
          response: "Please provide a tracking ID."
        });
      }

      const cleanedTrackingId =
        trackingId.toString()
          .replace(/\s+/g, '')
          .toUpperCase();

      console.log("Tracking search:", cleanedTrackingId);

      const order = await Order.findOne({
        trackingId: new RegExp(
          "^\\s*" + cleanedTrackingId + "\\s*$", "i"
        )
      });

      if (!order) {
        return res.json({
          success: false,
          response:
            `I couldn't find tracking ID ${cleanedTrackingId}.`
        });
      }

      return res.json({
        success: true,
        response:
          `Your shipment is ${order.status} and will arrive by ${order.eta}.`
      });

    }

    // -------------------------
    // RETURN REQUEST
    // -------------------------

    if (tool === "request_return") {

      let orderId =
        data.order_id ||
        data.orderId;

      if (!orderId) {
        return res.json({
          success: false,
          message: "Order ID missing"
        });
      }

      const cleanedOrderId =
        orderId.toString().replace(/\s+/g, '').toUpperCase();

      const order = await Order.findOne({
        orderId: new RegExp("^" + cleanedOrderId + "$", "i")
      });

      if (!order) {
        return res.json({
          success: false,
          message: "Order not found"
        });
      }

      await Order.findOneAndUpdate(
        { orderId: order.orderId },
        { returnRequested: true }
      );

      return res.json({
        success: true,
        order_id: order.orderId,
        return_requested: true,
        message: "Return request registered successfully"
      });

    }

    // -------------------------
    // ORDERS BY PHONE
    // -------------------------

    if (tool === "get_orders_by_phone") {

      let phone = data.phone;

      if (!phone) {
        return res.json({
          response: "Please provide your phone number."
        });
      }

      const orders = await Order.find({
        customerPhone: phone
      });

      if (orders.length === 0) {
        return res.json({
          response: "No orders found for this phone number."
        });
      }

      const orderList =
        orders.map(o => o.orderId).join(", ");

      return res.json({
        response: `You have the following orders: ${orderList}`
      });

    }

    // -------------------------
    // ORDER DETAILS
    // -------------------------

    if (tool === "get_order_details") {

      let orderId =
        data.order_id ||
        data.orderId;

      if (!orderId) {
        return res.json({
          response: "Please provide an order ID."
        });
      }

      const cleanedOrderId =
        orderId.toString().replace(/\s+/g, '').toUpperCase();

      const order = await Order.findOne({
        orderId: cleanedOrderId
      });

      if (!order) {
        return res.json({
          response: `I couldn't find order ${orderId}.`
        });
      }

      return res.json({
        response:
          `Order ${order.orderId} status is ${order.status}. Total amount is ${order.amount}. Delivery date is ${order.eta}.`
      });

    }

    // -------------------------
    // UNKNOWN REQUEST
    // -------------------------

    return res.json({
      response: "Invalid request."
    });

  }
  catch (error) {

    console.log(error);

    return res.json({
      response: "Server error."
    });

  }

});

export default router;