import { useEffect, useState, useRef, useCallback } from "react";
import API from "@/lib/api";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X, ExternalLink, Calendar, CheckCircle2, Clock, Copy, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

export default function PaymentOrders() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const [showAddForm, setShowAddForm] = useState(false);
	const [saving, setSaving] = useState(false);
	const [createdOrder, setCreatedOrder] = useState(null);

	// Add form state
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const [clientRef, setClientRef] = useState("");

	// Details Dialog state
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
	const [showDetailsDialog, setShowDetailsDialog] = useState(false);

	const observer = useRef();
	const lastOrderRef = useCallback(node => {
		if (loading || isFetchingMore) return;
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && hasMore) {
				setPage(prevPage => prevPage + 1);
			}
		});
		if (node) observer.current.observe(node);
	}, [loading, isFetchingMore, hasMore]);

	async function fetchOrders(pageNum = 1, replace = false) {
		if (replace) {
			setLoading(true);
		} else {
			setIsFetchingMore(true);
		}

		try {
			const { data } = await API.get(`/payment/list?page=${pageNum}&limit=10`);

			setOrders(prev => {
				if (replace || pageNum === 1) return data.orders;
				// Prevent duplicates
				const newOrders = data.orders.filter(o => !prev.find(p => p._id === o._id));
				return [...prev, ...newOrders];
			});

			setHasMore(data.pagination.page < data.pagination.pages);
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to fetch orders",
			);
		} finally {
			setLoading(false);
			setIsFetchingMore(false);
		}
	}

	// Initial load
	useEffect(() => {
		fetchOrders(1, true);
	}, []);

	// Handle page change for infinite scroll
	useEffect(() => {
		if (page > 1) {
			fetchOrders(page, false);
		}
	}, [page]);

	async function fetchOrderDetails(orderId) {
		setOrderDetailsLoading(true);
		setShowDetailsDialog(true);
		try {
			const { data } = await API.get(`/payment/${orderId}`);
			setSelectedOrder(data.data);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to fetch order details");
			setShowDetailsDialog(false);
		} finally {
			setOrderDetailsLoading(false);
		}
	}

	async function handleCreateOrder(e) {
		e.preventDefault();
		if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		setSaving(true);
		try {
			const { data } = await API.post("/payment/create", {
				amount: parseFloat(amount),
				note,
				clientRef: clientRef || undefined,
			});
			toast.success("Payment order created");
			setCreatedOrder(data.data);
			setAmount("");
			setNote("");
			setClientRef("");
			
			// Reset list
			setPage(1);
			fetchOrders(1, true);
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to create order",
			);
		} finally {
			setSaving(false);
		}
	}

	if (loading && page === 1) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Orders</h1>
				<p className="text-muted-foreground mt-4">Loading...</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Payment Orders</h1>
					<p className="text-muted-foreground mt-1">Generate and track your payment requests</p>
				</div>
				<div className="flex items-center gap-3">
					<Button onClick={() => setShowAddForm(true)} className="h-10">
						<Plus className="mr-1.5 h-4 w-4" />
						Create Order
					</Button>
				</div>
			</div>

			<Dialog 
				open={showAddForm} 
				onOpenChange={(open) => {
					setShowAddForm(open);
					if (!open) {
						setCreatedOrder(null);
						setAmount("");
						setNote("");
						setClientRef("");
					}
				}}
			>
				<DialogContent className="sm:max-w-[500px]">
					{!createdOrder ? (
						<>
							<DialogHeader className="space-y-2">
								<DialogTitle className="text-2xl font-black tracking-tighter uppercase">
									New Request
								</DialogTitle>
								<DialogDescription className="text-muted-foreground/90 text-[13px] font-medium leading-tight">
									Generate a new UPI payment link for your customers.
								</DialogDescription>
							</DialogHeader>
							<form
								onSubmit={handleCreateOrder}
								className="grid gap-6 pt-4"
							>
								<div className="space-y-2">
									<Label htmlFor="amount" className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
										Amount (INR) <span className="text-destructive">*</span>
									</Label>
									<Input
										id="amount"
										type="number"
										step="0.01"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder="e.g. 500.00"
										required
										autoComplete="off"
										className="rounded-lg h-11 border-muted-foreground/20 focus:border-primary transition-all text-base font-bold"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="clientRef" className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
										Reference Id (Optional)
									</Label>
									<Input
										id="clientRef"
										value={clientRef}
										onChange={(e) => setClientRef(e.target.value)}
										placeholder="Your internal ID"
										autoComplete="off"
										className="rounded-lg h-11 border-muted-foreground/20 focus:border-primary transition-all text-sm font-semibold"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="note" className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
										Payment Note
									</Label>
									<Input
										id="note"
										value={note}
										onChange={(e) => setNote(e.target.value)}
										placeholder="What is this payment for?"
										autoComplete="off"
										className="rounded-lg h-11 border-muted-foreground/20 focus:border-primary transition-all text-sm font-semibold"
									/>
								</div>

								<div className="pt-2">
									<Button
										type="submit"
										disabled={saving}
										className="w-full h-11"
									>
										{saving ? "Generating..." : "Generate Payment Link"}
									</Button>
								</div>
							</form>
						</>
					) : (
						<div className="py-2 sm:py-6 text-center animate-in zoom-in-95 duration-500">
							<div className="mx-auto h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6">
								<CheckCircle2 className="h-8 w-8" />
							</div>
							<h3 className="text-2xl font-black tracking-tight mb-1 uppercase">Success</h3>
							<p className="text-muted-foreground mb-8 text-[13px] font-medium leading-tight">Your payment order is ready for sharing.</p>
							
							<div className="grid gap-3 mb-8 bg-muted/20 p-6 rounded-2xl border border-muted/50">
								{createdOrder.clientRef && (
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">Reference Id:</span>
										<span className="font-mono font-bold">{createdOrder.clientRef}</span>
									</div>
								)}
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">Amount:</span>
									<span className="text-lg font-bold">₹{createdOrder.amount.toFixed(2)}</span>
								</div>
								<div className="flex flex-col gap-2 mt-2 pt-4 border-t border-muted/30">
									<Label className="text-left text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Payment Link</Label>
									<div className="flex gap-2">
										<Input 
											readOnly 
											value={createdOrder.upiLink} 
											className="bg-background/50 font-mono text-[11px] h-9"
										/>
										<Button 
											size="sm" 
											variant="secondary"
											className="h-9"
											onClick={() => {
												navigator.clipboard.writeText(createdOrder.upiLink);
												toast.success("Link copied to clipboard");
											}}
										>
											<Copy className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											className="h-9"
											onClick={() => window.open(createdOrder.upiLink, '_blank')}
										>
											<ExternalLink className="h-4 w-4" />
											
										</Button>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-center gap-3">
								<Button 
									variant="outline" 
									className="h-10 px-8 rounded-lg"
									onClick={() => {
										setCreatedOrder(null);
										setShowAddForm(false);
									}}
								>
									Close
								</Button>
								<Button 
									className="h-10 px-6 rounded-lg"
									onClick={() => setCreatedOrder(null)}
								>
									Create Another
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Orders List */}
			{orders.length === 0 ? (
				<div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
						<Calendar className="h-6 w-6 text-primary" />
					</div>
					<h3 className="text-lg font-semibold">No orders yet</h3>
					<p className="text-muted-foreground max-w-xs mx-auto">
						Start by creating your first payment order to see it listed here.
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{orders.map((order, index) => {
						// Last element gets the ref
						if (orders.length === index + 1) {
							return (
								<Card 
									ref={lastOrderRef}
									key={order._id} 
									className="relative overflow-hidden group border border-muted-foreground/10 hover:border-primary/40 transition-all duration-300 bg-card/40 backdrop-blur-sm cursor-pointer"
									onClick={() => fetchOrderDetails(order._id)}
								>
									<CardContentWrapper order={order} />
								</Card>
							)
						} else {
							return (
								<Card 
									key={order._id} 
									className="relative overflow-hidden group border border-muted-foreground/10 hover:border-primary/40 transition-all duration-300 bg-card/40 backdrop-blur-sm cursor-pointer"
									onClick={() => fetchOrderDetails(order._id)}
								>
									<CardContentWrapper order={order} />
								</Card>
							)
						}
					})}
					
					{isFetchingMore && (
						<div className="py-4 flex justify-center w-full">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					)}
				</div>
			)}

			<Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
				<DialogContent className="w-[98vw] sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] overflow-y-auto">
					{orderDetailsLoading ? (
						<div className="py-20 flex flex-col items-center justify-center gap-4">
							<div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
							<p className="text-sm text-muted-foreground animate-pulse">Fetching transactions...</p>
						</div>
					) : selectedOrder && (
						<div className="flex flex-col">
							{/* Header Gradient */}
							<div className={cn(
								"h-20 sm:h-24 px-4 sm:px-6 flex items-center justify-between relative",
								selectedOrder.status === 'success' ? 'bg-green-500/10' :
								selectedOrder.status === 'pending' ? 'bg-amber-500/10' :
								'bg-red-500/10'
							)}>
								<div className="flex items-center gap-3 sm:gap-4">
									<div className={cn(
										"h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shadow-sm",
										selectedOrder.status === 'success' ? 'bg-green-500 text-white' :
										selectedOrder.status === 'pending' ? 'bg-amber-500 text-white' :
										'bg-red-500 text-white'
									)}>
										{selectedOrder.status === 'success' ? <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" /> :
										 selectedOrder.status === 'pending' ? <Clock className="h-6 w-6 sm:h-8 sm:w-8" /> :
										 <X className="h-6 w-6 sm:h-8 sm:w-8" />}
									</div>
									<div>
										<h2 className="text-xl sm:text-2xl font-black tracking-tight">₹{selectedOrder.amount.toFixed(2)}</h2>
										<p className={cn(
											"text-[10px] font-black uppercase tracking-[0.2em] opacity-80",
											selectedOrder.status === 'success' ? 'text-green-600' :
											selectedOrder.status === 'pending' ? 'text-amber-600' :
											'text-red-600'
										)}>
											{selectedOrder.status}
										</p>
									</div>
								</div>
							<DialogClose className="absolute right-4 top-4 rounded-full p-1.5 bg-background/50 hover:bg-background transition-colors md:hidden">
								<X className="h-4 w-4" />
							</DialogClose>
							</div>

							<div className="p-6 space-y-8">
								{/* Transaction Info Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Date & Time</p>
										<p className="text-sm font-bold">{new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Reference Id</p>
										<div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
											navigator.clipboard.writeText(selectedOrder.clientRef);
											toast.success("Reference Id copied");
										}}>
											<p className="text-sm font-bold truncate max-w-[140px]">{selectedOrder.clientRef}</p>
											<Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
										</div>
									</div>
									{selectedOrder.utr && (
										<div className="space-y-1">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">UTR / Bank Ref</p>
											<div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
												navigator.clipboard.writeText(selectedOrder.utr);
												toast.success("UTR copied");
											}}>
												<p className="text-sm font-black text-primary">{selectedOrder.utr}</p>
												<Copy className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors" />
											</div>
										</div>
									)}
									{selectedOrder.txnTime && (
										<div className="space-y-1">
											<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Settlement Time</p>
											<p className="text-sm font-semibold">{new Date(selectedOrder.txnTime).toLocaleString()}</p>
										</div>
									)}
								</div>

								{/* Provider Info */}
								{selectedOrder.providerAccount && (
									<div className="rounded-2xl border border-muted/50 overflow-hidden bg-muted/5">
										<div className="px-4 py-2 border-b border-muted/50 bg-muted/10">
											<p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-[0.2em]">Routing Provider</p>
										</div>
										<div className="p-4 space-y-4">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-xl bg-background border border-muted/50 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
													{selectedOrder.providerAccount.provider?.providerPhoto ? (
														<img src={selectedOrder.providerAccount.provider.providerPhoto} alt="" className="w-full h-full object-contain" />
													) : (
														<ShieldCheck className="h-5 w-5 text-muted-foreground" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-bold truncate">{selectedOrder.providerAccount.provider?.name}</p>
													<p className="text-[11px] text-muted-foreground font-mono truncate">{selectedOrder.providerAccount.vpa}</p>
												</div>
											</div>
											<div className="pt-3 border-t border-muted/50 grid grid-cols-2 gap-4">
												<div className="space-y-0.5">
													<p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Merchant ID</p>
													<p className="text-xs font-mono font-bold truncate">{selectedOrder.providerAccount.merchantId}</p>
												</div>
												<div className="space-y-0.5 text-right">
													<p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Status</p>
													<span className="text-[10px] bg-green-500/10 text-green-600 font-bold px-2 py-0.5 rounded-full uppercase">Verified</span>
												</div>
											</div>
										</div>
									</div>
								)}

								{selectedOrder.note && (
									<div className="space-y-2">
										<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Note</p>
										<div className="p-4 rounded-xl bg-primary/[0.03] border border-primary/10 italic text-sm text-muted-foreground">
											"{selectedOrder.note}"
										</div>
									</div>
								)}

								<div className="flex flex-col sm:flex-row gap-3 pt-2">
									<Button 
										variant="outline" 
										className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest group"
										onClick={() => window.open(selectedOrder.upiLink, '_blank')}
									>
										Check Payment Page
										<ExternalLink className="h-3.5 w-3.5 ml-2 group-hover:text-primary transition-colors" />
									</Button>
									<Button 
										variant="secondary" 
										className="h-12 w-12 rounded-xl"
										onClick={() => {
											navigator.clipboard.writeText(selectedOrder.upiLink);
											toast.success("Payment Link copied");
										}}
									>
										<Copy className="h-5 w-5" />
									</Button>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

// Helper component for preventing duplicate code in the loop
function CardContentWrapper({ order }) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4">
			<div className="flex items-center gap-3 sm:gap-4">
				<div className={cn(
					"h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-inner transition-colors shrink-0",
					order.status === 'success' ? 'bg-green-500/10 text-green-600' :
					order.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
					'bg-red-500/10 text-red-600'
				)}>
					{order.status === 'success' ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> :
						order.status === 'pending' ? <Clock className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" /> :
						<X className="h-5 w-5 sm:h-6 sm:w-6" />}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-base sm:text-lg font-bold">₹{order.amount.toFixed(2)}</span>
						<span className={cn(
							"text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
							order.status === 'success' ? 'bg-green-500/20 text-green-700' :
							order.status === 'pending' ? 'bg-amber-500/20 text-amber-700' :
							'bg-red-500/20 text-red-700'
						)}>
							{order.status}
						</span>
					</div>
					<p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
						{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-x-12 gap-y-2">
				<div className="hidden md:block">
					<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Reference Id</p>
					<p className="text-base font-bold truncate max-w-[180px] text-foreground/90">
						{order.clientRef.length > 20 ? order.clientRef.substring(0, 20) + '...' : order.clientRef}
					</p>
				</div>
				<div className="hidden lg:block">
					<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Date & Time</p>
					<p className="text-sm font-bold text-foreground/80">
						{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
					</p>
				</div>
			</div>
		</div>
	);
}
