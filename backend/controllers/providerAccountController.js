import * as providerAccountService from "../services/providerAccountService.js";
import Provider from "../models/PaymentProvider.js";


export const createController = async (req, res, next) => {
	try {
		const result = await providerAccountService.createAccount(req.user._id, req.body);
		res.status(201).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const getAllController = async (req, res, next) => {
	try {
		const result = await providerAccountService.getAccounts(req.user._id);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const getOneController = async (req, res, next) => {
	try {
		const result = await providerAccountService.getAccountById(req.user._id, req.params.id);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const updateController = async (req, res, next) => {
	try {
		const result = await providerAccountService.updateAccount(req.user._id, req.params.id, req.body);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteController = async (req, res, next) => {
	try {
		const result = await providerAccountService.deleteAccount(req.user._id, req.params.id);
		res.status(200).json({
			status: "success",
			...result,
		});
	} catch (error) {
		next(error);
	}
};

export const getProvidersController = async (req, res, next) => {
	try {
		const providers = await Provider.find();
		res.status(200).json({
			status: "success",
			data: providers,
		});
	} catch (error) {
		next(error);
	}
};

