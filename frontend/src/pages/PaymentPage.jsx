import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export default function PaymentPage() {
	const { internalRef } = useParams();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState("pending"); // pending, success, failed

	async function fetchOrderDetails() {
		try {
			const { data } = await API.get(`/payment/details/${internalRef}`);
			setOrder(data.data);
			setStatus(data.data.status);
		} catch (error) {
			toast.error(error.response?.data?.message || "Order not found");
		} finally {
			setLoading(false);
		}
	}

	async function checkStatus() {
		if (status !== "pending") return;
		try {
			const { data } = await API.get(`/payment/status/${internalRef}`);
			if (data.status !== status) {
				setStatus(data.status);
				// Update order object with new data (like UTR) if status changed
				if (data.status === "success") {
					setOrder(prev => ({ ...prev, ...data }));
				}
			}
		} catch (error) {
			console.error("Status check failed", error);
		}
	}

	useEffect(() => {
		fetchOrderDetails();
	}, [internalRef]);

	// Poll for status every 3 seconds if pending
	useEffect(() => {
		let interval;
		if (status === "pending") {
			interval = setInterval(checkStatus, 3000);
		}
		return () => clearInterval(interval);
	}, [status, internalRef]);

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	const downloadQR = async () => {
		try {
			const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(order.qrPayload)}`;
			const response = await fetch(qrUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `payment-qr-${internalRef}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			toast.error("Failed to download QR code");
		}
	};

								{/* Waiting Indicator */}
								<div className="space-y-6">
									<p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-3">
										<Clock className="h-3 w-3 animate-pulse text-primary" />
										Waiting for payment confirmation
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Footer Note */}
						<div className="text-center space-y-4">
							<p className="text-[10px] text-muted-foreground px-8 leading-relaxed italic">
								Please do not refresh or close this page until the payment is confirmed. The session will timeout in a few minutes.
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
