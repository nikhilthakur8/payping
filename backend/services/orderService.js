import mongoose from "mongoose";
import PaymentOrder from "../models/PaymentOrder.js";
import UserProviderAccount from "../models/UserProviderAccount.js";
import Counter from "../models/Counter.js";
import ErrorHandler from "../utils/ErrorHandler.js";

import { getProviderStatus } from "../utils/providers/index.js";
import { sendWebhook } from "./webhookService.js";

// Helper to get next sequence for order ID
const getNextSequence = async (key) => {
	const counter = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true }
	);
	return counter.seq;
};

const formatOrderId = (seq) => {
	return `PAYPING${seq.toString().padStart(6, "0")}`;
};

export const createOrder = async (user, orderData) => {
	const { amount, note, clientRef } = orderData;

	// 1. Get default provider account
	const providerAccount = await UserProviderAccount.findOne({
		user: user._id,
		isDefault: true,
	});

	if (!providerAccount) {
		throw new ErrorHandler("Default provider account not found. Please set a default account.", 400);
	}

	// 2. Generate Internal Reference
	const seq = await getNextSequence("order_id");
	const internalRef = formatOrderId(seq);

	// 3. Client Ref (use internal if not provided)
	const finalClientRef = clientRef || internalRef;

	// Check if clientRef is unique for this user
	const existingOrder = await PaymentOrder.findOne({ user: user._id, clientRef: finalClientRef });
	if (existingOrder) {
		throw new ErrorHandler(`Order with reference ${finalClientRef} already exists`, 400);
	}

	// 4. Generate UPI Intent URL (qrPayload)
	// pa: VPA, pn: Name, am: Amount, cu: Currency, tn: Note/Ref, tr: Ref
	const vpa = providerAccount.vpa;
	const qrPayload = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(user.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || "Payment")}&tr=${internalRef}`;

	// 5. Generate Frontend Link
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
	const upiLink = `${frontendUrl}/payment/${internalRef}`;

	// 6. Create Order
	const order = await PaymentOrder.create({
		user: user._id,
		providerAccount: providerAccount._id,
		internalRef,
		clientRef: finalClientRef,
		amount,
		note,
		upiLink,
		qrPayload,
	});

	return {
		amount,
		note,
		upiLink,
		qrPayload,
	};
};

export const checkOrderStatus = async (internalRef) => {
	const order = await PaymentOrder.findOne({ internalRef })
		.populate("user")
		.populate({
			path: "providerAccount",
			populate: { path: "provider" }
		});

	if (!order) {
		throw new ErrorHandler("Order not found", 404);
	}

	function buildStatusResponse(order) {
		return {
			status: order.status,
			utr: order?.utr || null,
			txnID: order.internalRef,
			provider: order.providerAccount.provider?.name,
			amount: order.amount,
			clientRef: order.clientRef,
			txnTime: order?.txnTime || null,
		};
	}

	// 1. Check if already marked as success or failed (not pending)
	if (order.status !== "pending") {
		return buildStatusResponse(order);
	}

	// 2. Check 5 minute limit (expire if pending too long)
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
	if (order.createdAt < fiveMinutesAgo) {
		order.status = "failed";
		order.providerResponse = null;
		await order.save();

		// Trigger Webhook (background)
		sendWebhook(order);

		return buildStatusResponse(order);
	}

	// 3. Call Provider Status API
	const providerCode = order.providerAccount.provider?.code;
	const merchantId = order.providerAccount.merchantId;

	if (!providerCode || !merchantId) {
		throw new ErrorHandler("Provider configuration missing for this account", 400);
	}

	const providerData = await getProviderStatus(providerCode, merchantId, internalRef);

	if (providerData?.status === "success") {
		order.status = "success";
		order.utr = providerData.utr;
		order.txnTime = providerData.txnTime || new Date();
		order.providerResponse = providerData.rawResponse;
		await order.save();

		// Trigger Webhook (background)
		sendWebhook(order);
	}

	return buildStatusResponse(order);
};

/**
 * @desc Get minimal order details for public payment page
 */
export const getPublicOrderDetails = async (internalRef) => {
	const order = await PaymentOrder.findOne({ internalRef }).select("amount upiLink qrPayload clientRef status note utr");

	if (!order) {
		throw new ErrorHandler("Order not found", 404);
	}

	return order;
};

/**
 * @desc Get all orders for a user (Dashboard)
 */
export const fetchOrders = async (user, query) => {
	const { status, page = 1, limit = 50 } = query;
	const filter = { user: user._id };

	if (status) {
		filter.status = status;
	}

	const orders = await PaymentOrder.find(filter)
		.select("amount status internalRef clientRef utr txnTime createdAt")
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit);

	const total = await PaymentOrder.countDocuments(filter);

	return {
		orders,
		pagination: {
			total,
			page: parseInt(page),
			pages: Math.ceil(total / limit),
		},
	};
};

/**
 * @desc Get order details by ID for the user
 */
export const getOrderById = async (user, orderId) => {
	const order = await PaymentOrder.findOne({ _id: orderId, user: user._id })
		.populate({
			path: "providerAccount",
			populate: { path: "provider", select: "name code providerPhoto" }
		}).select("-internalRef -providerResponse");

	if (!order) {
		throw new ErrorHandler("Order not found", 404);
	}

	return order;
};

/**
 * @desc Get dashboard dashboard statistics
 */
export const getDashboardStats = async (user) => {
	const userId = user._id;

	// 1. Transaction counts by status
	const statusCounts = await PaymentOrder.aggregate([
		{ $match: { user: userId } },
		{ $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
	]);

	const stats = {
		totalCollection: 0,
		successCount: 0,
		failedCount: 0,
		pendingCount: 0,
	};

	statusCounts.forEach(item => {
		if (item._id === "success") {
			stats.totalCollection = item.totalAmount;
			stats.successCount = item.count;
		} else if (item._id === "failed") {
			stats.failedCount = item.count;
		} else if (item._id === "pending") {
			stats.pendingCount = item.count;
		}
	});

	// 2. Daily stats for the last 7 days
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	const dailyStats = await PaymentOrder.aggregate([
		{
			$match: {
				user: userId,
				status: "success",
				createdAt: { $gte: sevenDaysAgo }
			}
		},
		{
			$group: {
				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
				amount: { $sum: "$amount" },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	// Fill in missing days with zeros
	const chartData = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date();
		date.setDate(date.getDate() - (6 - i));
		const dateStr = date.toISOString().split("T")[0];

		const existingDay = dailyStats.find(d => d._id === dateStr);
		chartData.push({
			date: dateStr,
			amount: existingDay ? existingDay.amount : 0,
			count: existingDay ? existingDay.count : 0,
		});
	}

	// 3. Default Account Provider Info
	const defaultAccount = await UserProviderAccount.findOne({
		user: userId,
		isDefault: true
	}).populate("provider", "name code providerPhoto");

	return {
		stats,
		chartData,
		defaultAccount
	};
};
