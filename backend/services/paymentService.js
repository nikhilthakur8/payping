export const createPaymentOrder = async (orderData) => {
	// Logic to create order in DB and generate UPI/QR
	return { orderId: "123", ...orderData };
};

export const getStatus = async (orderId) => {
	// Logic to fetch status from DB
	return { orderId, status: "pending" };
};
