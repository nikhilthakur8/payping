import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const apiKeyMiddleware = async (req, res, next) => {
	try {
		let apiKey = req.headers["x-api-key"] || req.headers["api-key"];

		// Check for Bearer token in Authorization header
		if (!apiKey && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
			apiKey = req.headers.authorization.split(" ")[1];
		}

		if (!apiKey) {
			throw new ErrorHandler("API Key is required", 401);
		}

		const user = await User.findOne({ apiKey, status: "active" });

		if (!user) {
			throw new ErrorHandler("Invalid or inactive API Key", 401);
		}

		if (!user.isVerified) {
			throw new ErrorHandler("Account not verified", 403);
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};
