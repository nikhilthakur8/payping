import * as authService from "../services/authService.js";

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
