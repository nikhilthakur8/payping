import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const authMiddleware = async (req, res, next) => {
	try {
		let token;

		// 1. Check Bearer Token
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		}
		// 2. Check Cookies
		else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			throw new ErrorHandler("Authentication required", 401);
		}

		// Verify Token
		const decoded = verifyToken(token);
		if (!decoded) {
			throw new ErrorHandler("Invalid or expired token", 401);
		}

		// Check if user still exists
		const user = await User.findById(decoded.id).select("-passwordHash");
		if (!user) {
			throw new ErrorHandler("User not found", 401);
		}

		// Status check
		if (user.status === "blocked") {
			throw new ErrorHandler("Account is blocked", 403);
		}

		// Verification check
		if (!user.isVerified) {
			throw new ErrorHandler("Account not verified", 403);
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

// Same as authMiddleware but does NOT enforce email verification
export const authMiddlewareUnverified = async (req, res, next) => {
	try {
		let token;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			throw new ErrorHandler("Authentication required", 401);
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			throw new ErrorHandler("Invalid or expired token", 401);
		}

		const user = await User.findById(decoded.id).select("-passwordHash");
		if (!user) {
			throw new ErrorHandler("User not found", 401);
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const errorMiddleware = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		status: "error",
		message: err.message,
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
};
