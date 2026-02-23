import * as authService from "../services/authService.js";
import ErrorHandler from "../utils/ErrorHandler.js";

/**
 * @desc Register a new user
 * @route POST /auth/register
 * @access Public
 */
export const registerController = async (req, res, next) => {
	try {
		const result = await authService.register(req.body);
		res.status(201).json({
			status: "success",
			message: "User registered successfully",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Login user
 * @route POST /auth/login
 * @access Public
 */
export const loginController = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await authService.login(email, password);
		res.status(200).json({
			status: "success",
			message: "Login successful",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Send OTP to user email
 * @route POST /auth/send-otp
 * @access Public
 */
export const sendOTPController = async (req, res, next) => {
	try {
		const { email } = req.body;
		const result = await authService.sendOTP(email);
		res.status(200).json({
			status: "success",
			...result
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Verify OTP
 * @route POST /auth/verify-otp
 * @access Public
 */
export const verifyOTPController = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		const result = await authService.verifyOTP(email, otp);
		res.status(200).json({
			status: "success",
			...result
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Handle Google Login
 * @route POST /auth/google
 * @access Public
 */
export const googleLoginController = async (req, res, next) => {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			throw new ErrorHandler("ID Token is required", 400);
		}
		const result = await authService.googleLogin(idToken);
		res.status(200).json({
			status: "success",
			message: "Google login successful",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};
