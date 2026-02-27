import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Copy, ExternalLink, ShieldCheck, Share2, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentPage() {
	const { internalRef } = useParams();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState("pending"); // pending, success, failed
	const qrRef = useRef(null);

	const [timeLeft, setTimeLeft] = useState(0);

	async function fetchOrderDetails() {
		try {
			const { data } = await API.get(`/payment/details/${internalRef}`);
			setOrder(data.data);
			setStatus(data.data.status);
			setTimeLeft(data.data.expiresIn || 0);
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

	// Countdown timer for expiration
	useEffect(() => {
		if (status !== "pending" || timeLeft <= 0) return;
		const timerId = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(timerId);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timerId);
	}, [status, timeLeft]);

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	useEffect(() => {
		if (status === "success" && order?.redirectUri) {
			const timer = setTimeout(() => {
				window.location.href = order.redirectUri;
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [status, order]);

	const downloadQR = () => {
		try {
			const canvas = qrRef.current?.querySelector('canvas');
			if (!canvas) {
				toast.error("QR code not ready");
				return;
			}
			const url = canvas.toDataURL('image/png');
			const link = document.createElement('a');
			link.href = url;
			link.download = `payment-qr-${internalRef}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast.error("Failed to download QR code");
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<p className="text-muted-foreground animate-pulse">Initializing Secure Payment...</p>
				</div>
			</div>
		);
	}

	if (!order || (status === "pending" && timeLeft === 0 && order.createdAt)) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background px-4">
				<Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6 text-center">
						<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
						<h1 className="text-xl font-bold mb-2">Order Not Found or Expired</h1>
						<p className="text-muted-foreground mb-6">The payment link you followed might be invalid or expired.</p>
						<Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-6">
			{/* Brand Header */}
			<div className="mb-4 flex items-center gap-2">
				<div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
					<ShieldCheck className="h-5 w-5 text-primary-foreground" />
				</div>
				<span className="text-xl font-bold tracking-tighter">PayPing Secure</span>
			</div>

			<AnimatePresence mode="wait">
				{status === "success" ? (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md w-full"
					>
						<Card className="border-green-500/20 bg-green-500/5 backdrop-blur-md overflow-hidden">
							<div className="h-2 bg-green-500" />
							<CardContent className="pt-10 pb-8 text-center">
								<div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
									<CheckCircle2 className="h-10 w-10" />
								</div>
								<h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
								<p className="text-muted-foreground mb-8">Transaction completed and verified.</p>
								
								<div className="bg-background/40 rounded-2xl p-6 border border-border/50 space-y-3 mb-8 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount Paid:</span>
										<span className="font-bold">₹{order.amount.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Reference ID:</span>
										<span className="font-mono">{order.clientRef}</span>
									</div>
									{order.utr && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">UTR / Bank Ref:</span>
											<span className="font-mono font-bold text-primary">{order.utr}</span>
										</div>
									)}
								</div>

								<Button 
									className="w-full h-11" 
									onClick={() => {
										if (order.redirectUri) {
											window.location.href = order.redirectUri;
										} else {
											window.close();
											// Fallback if window.close() is blocked by the browser
											setTimeout(() => {
												window.location.href = "/";
											}, 100);
										}
									}}
								>
									{order.redirectUri ? "Return to Merchant" : "Close Secure Window"}
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : status === "failed" ? (
					<motion.div
						key="failed"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md w-full"
					>
						<Card className="border-destructive/20 bg-destructive/5 backdrop-blur-md overflow-hidden">
							<div className="h-2 bg-destructive" />
							<CardContent className="pt-10 pb-8 text-center">
								<div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
									<AlertCircle className="h-10 w-10" />
								</div>
								<h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
								<p className="text-muted-foreground mb-8">The payment session has expired or failed.</p>
								<Button className="w-full h-11" onClick={() => window.location.reload()}>
									Retry Payment
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : (
					<motion.div
						key="pending"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="max-w-md w-full space-y-4"
					>
						{/* Payment Card */}
						<Card className="border-border/40 bg-card/60 backdrop-blur-xl relative overflow-hidden">
							{status === "pending" && (
								<div className="h-0.5 w-full bg-muted/30">
									<div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
								</div>
							)}
							<CardHeader className="text-center pb-2">
								<CardDescription className="text-base font-bold uppercase tracking-widest text-foreground/80 mb-1">
									{order?.businessName || "Secure Checkout"}
								</CardDescription>

								<div className="text-4xl font-extrabold tracking-tight mb-1">
									<span className="text-sm font-medium mr-1">₹</span>
									{order.amount.toFixed(2)}
								</div>
								{order.note && (
									<p className="text-sm text-muted-foreground italic truncate px-4">
										"{order.note}"
									</p>
								)}
							</CardHeader>

							<CardContent className="space-y-4 pt-0">
								{/* QR Code Section */}
								<div className="flex flex-col items-center gap-4">
									<div ref={qrRef} className="relative w-44 h-44 bg-white p-2 rounded-xl group flex items-center justify-center">
										<QRCodeCanvas
											value={order.qrPayload}
											size={160}
											level="H"
											includeMargin={false}
										/>
									</div>
									
									<div className="flex flex-col items-center gap-3 w-full max-w-[220px]">
										{order.paytmIntent && (
											<Button
												variant="default"
												onClick={() => window.location.href = order.paytmIntent}
												className="w-full h-10 flex items-center justify-center gap-2 rounded bg-[#00baf2] hover:bg-[#0096c4] text-white font-semibold"
											>
												Pay with Paytm
											</Button>
										)}
										<div className="flex gap-2 w-full">
											<Button 
												variant="outline" 
												onClick={async () => {
													if (navigator.share) {
														try {
															await navigator.share({
																title: 'Payment QR',
																text: `Pay ₹${order.amount.toFixed(2)} via UPI`,
																url: order.qrPayload
															});
														} catch (err) {
															console.error("Share failed", err);
														}
													} else {
														copyToClipboard(order.qrPayload);
													}
												}}
												className="flex-1 h-10 flex items-center justify-center rounded"
												title="Share QR"
											>
												<Share2 className="h-5 w-5" />
											</Button>

											<Button 
												variant="outline" 
												onClick={downloadQR}
												className="flex-1 h-10 flex items-center justify-center rounded"
												title="Download QR"
											>
												<Download className="h-5 w-5" />
											</Button>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div className="pt-3 border-t border-border/20 space-y-3">
									{status === "pending" && timeLeft > 0 && (
										<div className="flex justify-center">
											<span className="text-xs text-red-500 font-mono font-bold tracking-wider bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
												{formatTime(timeLeft)}
											</span>
										</div>
									)}
									<div className="flex items-center justify-center gap-1.5 text-muted-foreground">
										<Clock className="h-3.5 w-3.5 text-primary shrink-0" />
										<p className="text-[10px] font-bold uppercase tracking-widest">
											Waiting for payment
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Footer Note */}
						<div className="text-center px-4">
							<p className="text-[9px] text-muted-foreground/60 leading-relaxed italic max-w-[280px] mx-auto">
								Please do not refresh or close this page until the payment is confirmed.
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
