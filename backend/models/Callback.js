import mongoose from "mongoose";

const callbackSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "PaymentOrder",
			required: true,
			index: true,
		},

		url: { type: String, required: true },

		payload: { type: Object },

		status: {
			type: String,
			enum: ["pending", "success", "retry", "failed"],
			default: "pending",
			index: true,
		},

		attempts: { type: Number, default: 0 },

		nextRetryAt: { type: Date, index: true },
	},
	{ timestamps: true },
);

export default mongoose.model("CallbackLog", callbackSchema);
