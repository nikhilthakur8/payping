import { getPaytmStatus } from "./paytm.js";

export const getProviderStatus = async (providerCode, merchantId, orderId) => {
	switch (providerCode.toLowerCase()) {
		case "paytm":
			return await getPaytmStatus(merchantId, orderId);
		// Add more providers here (phonepe, bharatpe, etc.)
		default:
			return null;
	}
};
