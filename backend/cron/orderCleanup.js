import cron from "node-cron";
import PaymentOrder from "../models/PaymentOrder.js";
import { sendWebhook } from "../services/webhookService.js";

// Run every 2 minutes
const cleanupJob = cron.schedule("*/2 * * * *", async () => {
	try {
		const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

		// Find pending orders older than 10 minutes (matches checkOrderStatus expiry)
		const expiredOrders = await PaymentOrder.find({
			status: "pending",
			createdAt: { $lt: tenMinutesAgo }
		})
			.populate("user")
			.populate({
				path: "providerAccount",
				populate: { path: "provider" }
			});

		if (expiredOrders.length > 0) {
			console.log(`Found ${expiredOrders.length} expired orders. Processing...`);

			for (const order of expiredOrders) {
				// Update status to failed
				order.status = "failed";
				await order.save();

				// Trigger webhook
				console.log(`Sending webhook for expired order: ${order.internalRef}`);
				await sendWebhook(order);
			}
		}
	} catch (error) {
		console.error("Error in order cleanup cron job:", error);
	}
});

export default cleanupJob;
