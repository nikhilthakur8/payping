import express from "express";
import { getWebhookLogs, retryWebhookLog } from "../controllers/webhookController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/logs").get(authMiddleware, getWebhookLogs);
router.route("/logs/:id/retry").post(authMiddleware, retryWebhookLog);

export default router;
