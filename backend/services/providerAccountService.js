import UserProviderAccount from "../models/UserProviderAccount.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createAccount = async (userId, accountData) => {
	const { provider, merchantId, vpa, isDefault } = accountData;

	const existingAccount = await UserProviderAccount.findOne({ user: userId, provider });
	if (existingAccount) {
		throw new ErrorHandler("You already have an account with this provider", 400);
	}

	// Check if this is the user's first provider account
	const totalAccounts = await UserProviderAccount.countDocuments({ user: userId });
	const shouldBeDefault = totalAccounts === 0 ? true : (isDefault || false);

	// If this account should be default, unset others first (safety check)
	if (shouldBeDefault) {
		await UserProviderAccount.updateMany(
			{ user: userId, isDefault: true },
			{ isDefault: false }
		);
	}

	const account = await UserProviderAccount.create({
		user: userId,
		provider,
		merchantId,
		vpa,
		isDefault: shouldBeDefault,
	});

	return account;
};

export const getAccounts = async (userId) => {
	return await UserProviderAccount.find({ user: userId }).populate("provider", "name code");
};

export const getAccountById = async (userId, accountId) => {
	const account = await UserProviderAccount.findOne({ _id: accountId, user: userId }).populate("provider", "name code");
	if (!account) {
		throw new ErrorHandler("Account not found", 404);
	}
	return account;
};

export const updateAccount = async (userId, accountId, updateData) => {
	// If unsetting as default, check if it's the only account
	if (updateData.isDefault === false) {
		const totalAccounts = await UserProviderAccount.countDocuments({ user: userId });
		if (totalAccounts <= 1) {
			throw new ErrorHandler("You must have at least one default provider account", 400);
		}
	}

	// If setting as default, unset others first
	if (updateData.isDefault === true) {
		await UserProviderAccount.updateMany(
			{ user: userId, _id: { $ne: accountId }, isDefault: true },
			{ isDefault: false }
		);
	}

	const account = await UserProviderAccount.findOneAndUpdate(
		{ _id: accountId, user: userId },
		updateData,
		{ new: true, runValidators: true }
	);

	if (!account) {
		throw new ErrorHandler("Account not found", 404);
	}

	return account;
};

export const deleteAccount = async (userId, accountId) => {
	const account = await UserProviderAccount.findOneAndDelete({ _id: accountId, user: userId });
	if (!account) {
		throw new ErrorHandler("Account not found", 404);
	}
	return { message: "Account deleted successfully" };
};
