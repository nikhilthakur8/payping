import express from "express";
import { createOrder, getOrderStatus } from "../controllers/orderController.js";
import { apiKeyMiddleware } from "../middleware/apiKeyMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createOrderSchema } from "../validations/orderSchema.js";

const router = express.Router();

/**
 * Merchant API Routes (Auth via x-api-key or Bearer Token)
 */

router.post("/orders", apiKeyMiddleware, validate(createOrderSchema), createOrder);

// Public Order Status Check
// router.get("/status/:internalRef", getOrderStatus);

export default router;