import crypto from "crypto";

const randomString = (length = 32) =>
	crypto.randomBytes(length).toString("hex");

export const generateApiKey = () => `pk_live_${randomString(16)}`;
export const generateWebhookSecret = () => `whsec_${randomString(32)}`;
