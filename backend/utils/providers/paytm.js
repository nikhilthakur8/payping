export const getPaytmStatus = async (merchantId, orderId) => {
	try {
		const url = `https://securegw.paytm.in/order/status?JsonData={"MID":"${merchantId}","ORDERID":"${orderId}"}`;

		const response = await fetch(url);
		const data = await response.json();

		const status = data.STATUS === "TXN_SUCCESS" ? "success" : "pending";
		const utr = data.BANKTXNID  || null;
		const txnTime = data.TXNDATE ? new Date(data.TXNDATE) : null;

		return {
			status,
			utr,
			txnTime,
			rawResponse: data,
		};
	} catch (error) {
		console.error("Paytm Status Check Error:", error);
		return {
			status: "pending",
			utr: null,
			txnTime: null,
			rawResponse: null,
		};
	}
};
