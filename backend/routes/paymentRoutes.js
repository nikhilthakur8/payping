import express from "express";
import { createOrder, getOrderStatus, getPublicOrderDetails, listOrders, getOrderDetails, getDashboardStatsController } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createOrderDashboardSchema } from "../validations/orderSchema.js";

const router = express.Router();

// Dashboard order routes
router.post("/create", authMiddleware, validate(createOrderDashboardSchema), createOrder);
router.get("/list", authMiddleware, listOrders);
router.get("/stats", authMiddleware, getDashboardStatsController);
router.get("/:id", authMiddleware, getOrderDetails);

// Public Order Routes (No Auth)
router.get("/details/:internalRef", getPublicOrderDetails);
router.get("/status/:internalRef", getOrderStatus);

export default router;
