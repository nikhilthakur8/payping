import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Copy, ExternalLink, ShieldCheck, Share2, Download } from "lucide-react";

export default function PaymentPage() {
	const { internalRef } = useParams();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState("pending"); // pending, success, failed

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
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
			{/* Brand Header */}
			<div className="mb-8 flex items-center gap-2">
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
						className="max-w-md w-full space-y-6"
					>
						{/* Payment Card */}
						<Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
							{/* Pulse Line */}
							<div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20">
								<motion.div 
									className="h-full bg-primary shadow-[0_0_10px_#fff]"
									animate={{ left: ["-100%", "100%"] }}
									transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
									style={{ width: "30%", position: "absolute" }}
								/>
							</div>

							<CardHeader className="text-center pb-2">
								<CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
									Secure Checkout
								</CardDescription>
								<div className="text-4xl font-extrabold tracking-tight mb-2">
									<span className="text-sm font-medium mr-1">₹</span>
									{order.amount.toFixed(2)}
								</div>
								{order.note && (
									<p className="text-sm text-muted-foreground italic truncate px-4">
										"{order.note}"
									</p>
								)}
							</CardHeader>

							<CardContent className="space-y-8 pt-4">
								{/* QR Code Section */}
								<div className="flex flex-col items-center gap-4">
									<div className="relative w-48 h-48 bg-white p-3 rounded-2xl shadow-inner group">
										<img 
											src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.qrPayload)}`}
											alt="UPI QR Code"
											className="w-full h-full"
										/>
									</div>
									
									<div className="flex flex-col items-center gap-3 w-full max-w-[220px]">
										{order.paytmIntent && (
											<Button
												variant="default"
												onClick={() => window.location.href = order.paytmIntent}
												className="w-full h-12 flex items-center justify-center gap-2 rounded-xl transition-all shadow-md font-bold bg-[#00baf2] hover:bg-[#00a3d9] text-white md:hidden"
											>
												Pay with Paytm
											</Button>
										)}
										<Button 
											variant="default" 
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
											className="w-full h-12 flex items-center justify-center gap-2 rounded-xl transition-all shadow-md font-semibold"
										>
											<Share2 className="h-4 w-4" />
											Share QR
										</Button>

										<Button 
											variant="outline" 
											onClick={downloadQR}
											className="w-full h-12 flex items-center justify-center gap-2 rounded-xl transition-all shadow-md font-semibold"
										>
											<Download className="h-4 w-4" />
											Download QR
										</Button>
									</div>
								</div>

								{/* Waiting Indicator */}
								<div className="space-y-6">
									<p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-3">
										<Clock className="h-3 w-3 animate-pulse text-primary" />
										Waiting for payment confirmation
									</p>
									{status === "pending" && timeLeft > 0 && (
										<div className="flex items-center justify-center gap-2">
											<span className="text-sm font-semibold text-muted-foreground">Expires in:</span>
											<span className="font-mono text-xl font-bold text-primary">{formatTime(timeLeft)}</span>
										</div>
									)}
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
