import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		}, // paytm, phonepe
		name: {
			type: String,
			required: true,
		},
		providerPhoto: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true },
);

export default mongoose.model("Provider", providerSchema);
