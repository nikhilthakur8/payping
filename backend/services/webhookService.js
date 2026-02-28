import crypto from "crypto";
import cron from "node-cron";
import CallbackLog from "../models/Callback.js";

const RETRY_INTERVALS = [
	5 * 60 * 1000, // 5 minutes
	30 * 60 * 1000, // 30 minutes
	12 * 60 * 60 * 1000, // 12 hours
	24 * 60 * 60 * 1000, // 24 hours
];

/**
 * @desc Sign the webhook payload using the user's secret
 */
const generateSignature = (payload, secret) => {
	if (!secret) return null;
	return crypto
		.createHmac("sha256", secret)
		.update(JSON.stringify(payload))
		.digest("hex");
};

/**
 * @desc Helper to handle fetch and backoff logic
 */
const processWebhookLog = async (log, url, payload, signature) => {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(signature && { "x-payping-signature": signature }),
			},
			body: JSON.stringify(payload),
		});
		log.attempts += 1;
		if (response.ok) {
			log.status = "success";
		} else {
			if (log.attempts <= RETRY_INTERVALS.length) {
				log.status = "retry";
				log.nextRetryAt = new Date(Date.now() + RETRY_INTERVALS[log.attempts - 1]);
			} else {
				log.status = "failed";
				log.nextRetryAt = null;
			}
		}
		await log.save();
	} catch (error) {
		console.error(`Webhook Delivery Error for log ${log._id}: `, error.message || error);
		log.attempts += 1;

		if (log.attempts <= RETRY_INTERVALS.length) {
			log.status = "retry";
			log.nextRetryAt = new Date(Date.now() + RETRY_INTERVALS[log.attempts - 1]);
		} else {
			log.status = "failed";
			log.nextRetryAt = null;
		}
		await log.save();
	}
};

/**
 * @desc Manually retry a specific webhook log (resets attempt tracking for a fresh delivery)
 */
export const manualRetryWebhook = async (log, user) => {
	const url = user.callbackUrl || log.url;
	if (!url) throw new Error("No callback URL configured");

	const signature = generateSignature(log.payload, user.webhookSecret);

	await processWebhookLog(log, url, log.payload, signature);
	return log;
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
		const signature = generateSignature(payload, user.webhookSecret);

		// 4. Create Initial Log atomically to prevent duplicates
		let log;
		try {
			const result = await CallbackLog.updateOne(
				{ order: order._id, "payload.status": payload.status },
				{
					$setOnInsert: {
						user: user._id,
						order: order._id,
						url: user.callbackUrl,
							payload,
							status: "pending",
						}
				},
				{ upsert: true }
			);

			// If it wasn't upserted, it already existed (another thread beat us to it)
			if (result.upsertedCount === 0) {
				console.log(`[Webhook] Duplicate webhook for order ${order.clientRef || order._id} status ${payload.status} suppressed.`);
				return;
			}

			// Fetch the newly upserted log document for further processing
			log = await CallbackLog.findById(result.upsertedId);
		} catch (dbError) {
			console.error("Failed to create webhook log:", dbError);
			return;
		}

		// 5. Execute Request
		if (log) {
			await processWebhookLog(log, user.callbackUrl, payload, signature);
			return log;
		}
	} catch (error) {
		console.error("Webhook Setup Failed:", error);
	}
};

/**
 * @desc Cron job to process pending/retry webhooks automatically
 * Runs every 5 minutes
 */
export const webhookRetryJob = cron.schedule("*/5 * * * *", async () => {
	try {
		const now = new Date();
		const pendingLogs = await CallbackLog.find({
			$or: [
				{ status: "retry", nextRetryAt: { $lte: now } },
				{ status: "pending", createdAt: { $lte: new Date(now.getTime() - 5 * 60 * 1000) } }
			]
		}).populate("user");

		if (pendingLogs.length === 0) return;

		console.log(`[Webhook Cron] Found ${pendingLogs.length} pending webhooks to retry.`);

		for (const log of pendingLogs) {
			const user = log.user;
			if (!user || (!user.callbackUrl && !log.url)) {
				log.status = "failed";
				await log.save();
				continue;
			}

			const url = user.callbackUrl || log.url;
			const signature = generateSignature(log.payload, user.webhookSecret);

			await processWebhookLog(log, url, log.payload, signature);
		}
	} catch (error) {
		console.error("[Webhook Cron] Error processing retries:", error);
	}
});
