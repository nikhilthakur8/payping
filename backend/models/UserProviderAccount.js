import mongoose from "mongoose";

const userProviderAccountSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		provider: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Provider",
			required: true,
			index: true,
		},

		merchantId: {
			type: String,
			required: true,
		},

		vpa: {
			type: String,
			required: true,
			index: true,
		},


		isDefault: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

// Ensure a user can have only one account per provider
userProviderAccountSchema.index({ user: 1, provider: 1 }, { unique: true });

// Ensure a user can have only one default account
userProviderAccountSchema.index(
	{ user: 1, isDefault: 1 },
	{ unique: true, partialFilterExpression: { isDefault: true } }
);

export default mongoose.model("UserProviderAccount", userProviderAccountSchema);
