import CallbackLog from "../models/Callback.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { manualRetryWebhook } from "../services/webhookService.js";

/**
 * @desc Get all webhook logs for the logged-in user
 * @route GET /webhook/logs
 * @access Private
 */
export const getWebhookLogs = async (req, res, next) => {
	try {
		const { page = 1, limit = 50, status } = req.query;

		const filter = { user: req.user._id };
		if (status) {
			filter.status = status;
		}

		const logs = await CallbackLog.find(filter)
			.populate("order", "internalRef amount clientRef")
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(parseInt(limit));

		const total = await CallbackLog.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: logs,
			pagination: {
				total,
				page: parseInt(page),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Manually retry a webhook delivery
 * @route POST /webhook/logs/:id/retry
 * @access Private
 */
export const retryWebhookLog = async (req, res, next) => {
	try {
		const log = await CallbackLog.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!log) {
			throw new ErrorHandler("Webhook log not found", 404);
		}

		if (log.status === "success") {
			throw new ErrorHandler("This webhook was already delivered successfully", 400);
		}

		if (log.status === "pending") {
			throw new ErrorHandler("This webhook is already being processed", 400);
		}

		if (log.status === "failed") {
			throw new ErrorHandler("This webhook has permanently failed and cannot be retried", 400);
		}

		const updated = await manualRetryWebhook(log, req.user);

		res.status(200).json({
			success: true,
			data: await updated.populate("order", "internalRef amount clientRef"),
		});
	} catch (error) {
		next(error);
	}
};
