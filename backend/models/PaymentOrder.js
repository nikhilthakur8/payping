import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		providerAccount: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "UserProviderAccount",
			required: true,
		},

		internalRef: {
			type: String,
			required: true,
			unique: true,
		},

		clientRef: {
			type: String,
			required: true,
		},

		amount: {
			type: Number,
			required: true,
		},

		note: { type: String },

		upiLink: { type: String },
		qrPayload: { type: String },

		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
			index: true,
		},

		utr: {
			type: String,
			sparse: true,
		},

		txnTime: { type: Date },

		providerResponse: { type: Object },
	},
	{ timestamps: true },
);

orderSchema.index({ user: 1, clientRef: 1 }, { unique: true });
orderSchema.index({ providerAccount: 1, amount: 1, status: 1 });



export default mongoose.model("PaymentOrder", orderSchema);
