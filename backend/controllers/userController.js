import * as userService from "../services/userService.js";

/**
 * @desc Get logged in user profile
 * @route GET /user/profile
 * @access Private
 */
export const profileController = async (req, res, next) => {
	try {
		// req.user is set by authMiddleware
		const result = await userService.getUserProfile(req.user);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Get detailed user profile with keys
 * @route GET /user/detailed-profile
 * @access Private
 */
export const detailedProfileController = async (req, res, next) => {
	try {
		const result = await userService.getDetailedProfile(req.user);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Update user profile
 * @route PUT /user/profile
 * @access Private
 */
export const updateProfileController = async (req, res, next) => {
	try {
		const result = await userService.updateProfile(req.user, req.body);
		res.status(200).json({
			status: "success",
			message: "Profile updated successfully",
			data: {
				name: result.name,
				callbackUrl: result.callbackUrl,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Generate new API key
 * @route POST /user/generate-api-key
 * @access Private
 */
export const generateApiKeyController = async (req, res, next) => {
	try {
		const apiKey = await userService.generateNewApiKey(req.user);
		res.status(200).json({
			status: "success",
			message: "API key generated successfully",
			data: { apiKey },
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Generate new Webhook Secret
 * @route POST /user/generate-webhook-secret
 * @access Private
 */
export const generateWebhookSecretController = async (req, res, next) => {
	try {
		const webhookSecret = await userService.generateNewWebhookSecret(req.user);
		res.status(200).json({
			status: "success",
			message: "Webhook secret generated successfully",
			data: { webhookSecret },
		});
	} catch (error) {
		next(error);
	}
};
