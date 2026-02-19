import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},

		passwordHash: {
			type: String,
			required: true,
		},

		status: {
			type: String,
			enum: ["active", "blocked"],
			default: "active",
			index: true,
		},

		isVerified: {
			type: Boolean,
			default: false,
		},

		apiKey: {
			type: String,
			unique: true,
		},

		// Webhook
		webhookSecret: {
			type: String,
			unique: true,
		},

		callbackUrl: {
			type: String,
		},

		// For password reset
		resetPasswordOTP: {
			type: String,
		},

		resetPasswordOTPExpires: {
			type: Date,
		},

		// For email verification
		emailVerificationOTP: {
			type: String,
		},
		emailVerificationOTPExpires: {
			type: Date,
		},
		otpLastSentAt: {
			type: Date,
		},

		// MetaData
		lastLoginAt: { type: Date },
	},
	{ timestamps: true },
);

export default mongoose.model("User", userSchema);
