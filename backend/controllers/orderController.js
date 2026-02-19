import * as orderService from "../services/orderService.js";

/**
 * @desc Create a new payment order
 * @route POST /user/orders (Frontend)
 * @route POST /api/orders (Merchant API)
 * @access Private
 */
export const createOrder = async (req, res, next) => {
	try {
		// Shared logic: req.user is used by Dasboard or API
		const order = await orderService.createOrder(req.user, req.body);

		res.status(201).json({
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Get public order details for payment page
 * @route GET /payment/details/:internalRef
 */
export const getPublicOrderDetails = async (req, res, next) => {
	try {
		const { internalRef } = req.params;
		const order = await orderService.getPublicOrderDetails(internalRef);

		res.status(200).json({
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Check order status
 * @route GET /payment/status/:internalRef
 * @route GET /api/status/:internalRef
 */
export const getOrderStatus = async (req, res, next) => {
	try {
		const { internalRef } = req.params;
		const status = await orderService.checkOrderStatus(internalRef);

		res.status(200).json(status);
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Get all user orders
 * @route GET /payment/orders
 */
export const listOrders = async (req, res, next) => {
	try {
		const result = await orderService.fetchOrders(req.user, req.query);
		res.status(200).json({
			status: "success",
			...result,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Get single order details
 * @route GET /payment/orders/:id
 */
export const getOrderDetails = async (req, res, next) => {
	try {
		const { id } = req.params;
		const order = await orderService.getOrderById(req.user, id);
		res.status(200).json({
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @desc Get dashboard analytics
 * @route GET /payment/stats
 */
export const getDashboardStatsController = async (req, res, next) => {
	try {
		const stats = await orderService.getDashboardStats(req.user);
		res.status(200).json({
			status: "success",
			data: stats,
		});
	} catch (error) {
		next(error);
	}
};
