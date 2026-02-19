import express from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import apiRoutes from "./apiRoutes.js";
import providerAccountRoutes from "./providerAccountRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

// Dashboard Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/provider", providerAccountRoutes);
router.use("/payment", paymentRoutes);

// Merchant API Routes
router.use("/api", apiRoutes);

export default router;
