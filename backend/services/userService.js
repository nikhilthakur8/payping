import { generateApiKey,generateWebhookSecret } from "../utils/keys.js";

export const getUserProfile = async (user) => {
	// user object is already attached to req by authMiddleware
	return {
		_id: user._id,
		name: user.name,
		email: user.email,
		status: user.status,
		isVerified: user.isVerified,
		createdAt: user.createdAt,
	};
};

export const getDetailedProfile = async (user) => {
	return {
		_id: user._id,
		name: user.name,
		email: user.email,
		status: user.status,
		isVerified: user.isVerified,
		apiKey: user.apiKey,
		webhookSecret: user.webhookSecret,
		callbackUrl: user.callbackUrl,
		createdAt: user.createdAt,
	};
};

export const updateProfile = async (user, updateData) => {
	const { name, callbackUrl } = updateData;

	if (name) user.name = name;
	if (callbackUrl !== undefined) user.callbackUrl = callbackUrl;

	await user.save();
	return user;
};

export const generateNewApiKey = async (user) => {
	user.apiKey = generateApiKey();
	await user.save();
	return user.apiKey;
};

export const generateNewWebhookSecret = async (user) => {
	user.webhookSecret = generateWebhookSecret();
	await user.save();
	return user.webhookSecret;
};

