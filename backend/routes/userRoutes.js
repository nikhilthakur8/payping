import express from "express";
import {
	profileController,
	detailedProfileController,
	updateProfileController,
	generateApiKeyController,
	generateWebhookSecretController,
} from "../controllers/userController.js";
import {
	authMiddleware,
	authMiddlewareUnverified,
} from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { updateProfileSchema } from "../validations/userSchema.js";

const router = express.Router();

router.get("/profile", authMiddlewareUnverified, profileController);
router.get("/detailed-profile", authMiddleware, detailedProfileController);
router.put(
	"/profile",
	authMiddleware,
	validate(updateProfileSchema),
	updateProfileController,
);
router.post("/generate-api-key", authMiddleware, generateApiKeyController);
router.post("/generate-webhook-secret", authMiddleware, generateWebhookSecretController);


export default router;
