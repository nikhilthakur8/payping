import crypto from "crypto";
import CallbackLog from "../models/Callback.js";

/**
 * @desc Sign the webhook payload using the user's secret
 */
const generateSignature = (payload, secret) => {
	return crypto
		.createHmac("sha256", secret)
		.update(JSON.stringify(payload))
		.digest("hex");
};

/**
 * @desc Send webhook notification to the merchant
 */
export const sendWebhook = async (order) => {
	try {
		// 1. User Profile is already populated in order.user
		const user = order.user;
		if (!user || !user.callbackUrl) return;

		// 2. Prepare Payload
		const payload = {
			status: order.status,
			utr: order.utr || null,
			ref: order.clientRef,
			amount: order.amount,
			txnTime: order.txnTime || order.updatedAt,
			provider: order.providerAccount?.provider?.name || "Unknown",
		};

		// 3. Generate Signature
		const signature = user.webhookSecret
			? generateSignature(payload, user.webhookSecret)
			: null;

		// 4. Create Initial Log
		const log = await CallbackLog.create({
			user: user._id,
			order: order._id,
			url: user.callbackUrl,
			payload,
			status: "pending",
		});

		// 5. Execute Request
		const response = await fetch(user.callbackUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-payping-signature": signature,
			},
			body: JSON.stringify(payload),
		});

		// 6. Update Log based on response
		if (response.ok) {
			log.status = "success";
			log.attempts += 1;
			await log.save();
		} else {
			log.attempts += 1;

			// Exponential backoff strategy: 5m -> 30m -> 12h -> 24h
			const retryIntervals = [
				5 * 60 * 1000, // 5 minutes
				30 * 60 * 1000, // 30 minutes
				12 * 60 * 60 * 1000, // 12 hours
				24 * 60 * 60 * 1000, // 24 hours
			];

			if (log.attempts <= retryIntervals.length) {
				log.status = "retry";
				const interval = retryIntervals[log.attempts - 1];
				log.nextRetryAt = new Date(Date.now() + interval);
			} else {
				log.status = "failed";
				log.nextRetryAt = null;
			}
			await log.save();
		}

		return log;
	} catch (error) {
		console.error("Webhook Delivery Failed:", error);
	}
};
