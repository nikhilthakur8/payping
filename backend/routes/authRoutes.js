import express from "express";
import { loginController, registerController, sendOTPController, verifyOTPController, googleLoginController } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema, registerSchema, sendOTPSchema, verifyOTPSchema } from "../validations/authSchema.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

router.post("/send-otp", validate(sendOTPSchema), sendOTPController);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTPController);
router.post("/google", googleLoginController);

export default router;
