import User from "../models/User.js";
import bcrypt from "bcryptjs";
import ErrorHandler from "../utils/ErrorHandler.js";
import { signToken } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";
import { generateApiKey, generateWebhookSecret } from "../utils/keys.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate 6 digit OTP
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new ErrorHandler("User not found", 404);
	}

	const OTP_COOLDOWN = 1 * 60 * 1000; // 1 minute in milliseconds
	if (user.otpLastSentAt && Date.now() - user.otpLastSentAt < OTP_COOLDOWN) {
		const secondsLeft = Math.ceil(
			(OTP_COOLDOWN - (Date.now() - user.otpLastSentAt)) / 1000,
		);
		throw new ErrorHandler(
			`Please wait ${secondsLeft} seconds before requesting a new OTP`,
			429,
		);
	}

	const otp = generateOTP();
	user.emailVerificationOTP = otp;
	user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
	user.otpLastSentAt = Date.now();
	await user.save();

	const message = `Your PayPing verification OTP is ${otp}. It is valid for 10 minutes.`;

	try {
		await sendEmail({
			email: user.email,
			subject: "PayPing Email Verification",
			message,
		});
	} catch (error) {
		user.emailVerificationOTP = undefined;
		user.emailVerificationOTPExpires = undefined;
		await user.save();
		throw new ErrorHandler("Email could not be sent", 500);
	}

	return { message: "OTP sent to email" };
};

export const verifyOTP = async (email, otp) => {
	const user = await User.findOne({
		email,
		emailVerificationOTP: otp,
		emailVerificationOTPExpires: { $gt: Date.now() },
	});

	if (!user) {
		throw new ErrorHandler("Invalid or expired OTP", 400);
	}

	user.isVerified = true;
	user.emailVerificationOTP = undefined;
	user.emailVerificationOTPExpires = undefined;
	await user.save();

	return { message: "Email verified successfully" };
};

export const register = async (userData) => {
	const { name, email, password } = userData;

	// Check if user exists
	const userExists = await User.findOne({ email });
	if (userExists) {
		throw new ErrorHandler("User with this email already exists", 400);
	}

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	// Create user
	const user = await User.create({
		name,
		email,
		passwordHash,
		apiKey: generateApiKey(),
		webhookSecret: generateWebhookSecret(),
	});

	// Generate JWT
	const token = signToken({ id: user._id, email: user.email });

	return {
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			isVerified: user.isVerified,
		},
		token,
	};
};

export const login = async (email, password) => {
	// Find user
	const user = await User.findOne({ email });
	if (!user) {
		throw new ErrorHandler("Invalid email or password", 401);
	}

	// Check password
	const isMatch = await bcrypt.compare(password, user.passwordHash);
	if (!isMatch) {
		throw new ErrorHandler("Invalid email or password", 401);
	}

	// Generate JWT
	const token = signToken({ id: user._id, email: user.email });

	return {
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			isVerified: user.isVerified,
		},
		token,
	};
};

export const googleLogin = async (idToken) => {
	let userData;

	try {
		// Try verifying as an ID Token first (for GoogleLogin component)
		const ticket = await client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		userData = {
			name: payload.name,
			email: payload.email,
			googleId: payload.sub,
		};
	} catch (error) {
		// If ID token verification fails, try as an Access Token (for custom button)
		try {
			const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
			userData = await res.json();
			if (!userData.email) throw new Error();
			userData.googleId = userData.sub;
		} catch (innerError) {
			throw new ErrorHandler("Invalid Google Token", 401);
		}
	}

	const { name, email, googleId } = userData;

	let user = await User.findOne({ email });

	if (user) {
		if (!user.googleId) {
			user.googleId = googleId;
			await user.save();
		}
	} else {
		user = await User.create({
			name,
			email,
			googleId,
			isVerified: true,
			apiKey: generateApiKey(),
			webhookSecret: generateWebhookSecret(),
		});
	}

	if (user.status === "blocked") {
		throw new ErrorHandler("Your account has been blocked", 403);
	}

	const token = signToken({ id: user._id, email: user.email });

	return {
		user: {
			_id: user._id,
			name: user.name,
			email: user.email,
			isVerified: user.isVerified,
		},
		token,
	};
};
