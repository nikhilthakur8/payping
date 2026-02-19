import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export const signToken = (payload) => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES,
	});
};

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
};
