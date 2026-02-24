import { useEffect, useState, useRef, useCallback } from "react";
import API from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
	Webhook,
	CheckCircle2,
	Clock,
	RefreshCw,
	XCircle,
	ExternalLink,
	Copy,
	Loader2,
	ArrowRight,
	Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
	success: {
		label: "Delivered",
		color: "text-green-600",
		bg: "bg-green-500/10",
		border: "border-green-500/20",
		icon: CheckCircle2,
	},
	pending: {
		label: "Pending",
		color: "text-amber-600",
		bg: "bg-amber-500/10",
		border: "border-amber-500/20",
		icon: Clock,
	},
	retry: {
		label: "Retrying",
		color: "text-blue-600",
		bg: "bg-blue-500/10",
		border: "border-blue-500/20",
		icon: RefreshCw,
	},
	failed: {
		label: "Failed",
		color: "text-red-600",
		bg: "bg-red-500/10",
		border: "border-red-500/20",
		icon: XCircle,
	},
};

export default function WebhookLogs() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [statusFilter, setStatusFilter] = useState("all");

	const [selectedLog, setSelectedLog] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [retrying, setRetrying] = useState(false);

	const observer = useRef();
	const lastLogRef = useCallback(
		(node) => {
			if (loading || isFetchingMore) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setPage((prev) => prev + 1);
				}
			});
			if (node) observer.current.observe(node);
		},
		[loading, isFetchingMore, hasMore],
	);

	async function fetchLogs(pageNum = 1, replace = false) {
		if (replace) {
			setLoading(true);
		} else {
			setIsFetchingMore(true);
		}

		try {
			const params = new URLSearchParams({ page: pageNum, limit: 20 });
			if (statusFilter !== "all") {
				params.set("status", statusFilter);
			}

			const { data } = await API.get(`/webhook/logs?${params}`);

			setLogs((prev) => {
				if (replace || pageNum === 1) return data.data;
				const newLogs = data.data.filter(
					(l) => !prev.find((p) => p._id === l._id),
				);
				return [...prev, ...newLogs];
			});

			setHasMore(data.pagination.page < data.pagination.pages);
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to fetch webhook logs",
			);
		} finally {
			setLoading(false);
			setIsFetchingMore(false);
		}
	}

	useEffect(() => {
		setPage(1);
		setLogs([]);
		fetchLogs(1, true);
	}, [statusFilter]);

	useEffect(() => {
		if (page > 1) {
			fetchLogs(page, false);
		}
	}, [page]);

	function handleStatusChange(value) {
		setStatusFilter(value);
	}

	function openDetail(log) {
		setSelectedLog(log);
		setShowDetail(true);
	}

	async function handleRetryNow(logId) {
		setRetrying(true);
		try {
			const { data } = await API.post(`/webhook/logs/${logId}/retry`);
			const updated = data.data;

			setSelectedLog(updated);
			setLogs((prev) =>
				prev.map((l) => (l._id === updated._id ? updated : l)),
			);

			if (updated.status === "success") {
				toast.success("Webhook delivered successfully");
			} else {
				toast.info("Retry attempted - webhook did not succeed");
			}
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to retry webhook",
			);
		} finally {
			setRetrying(false);
		}
	}

	function formatDate(dateStr) {
		return new Date(dateStr).toLocaleString(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		});
	}

	if (loading && page === 1) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Webhook Logs
				</h1>
				<div className="flex items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						Webhook Logs
					</h1>
					<p className="text-muted-foreground mt-1">
						Monitor your webhook delivery attempts and retries
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Select
						value={statusFilter}
						onValueChange={handleStatusChange}
					>
						<SelectTrigger className="w-[150px] h-10 rounded-lg">
							<SelectValue placeholder="Filter status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="success">Delivered</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="retry">Retrying</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="icon"
						className="h-10 w-10 rounded-lg"
						onClick={() => {
							setPage(1);
							fetchLogs(1, true);
						}}
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Logs List */}
			{logs.length === 0 ? (
				<div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
						<Webhook className="h-6 w-6 text-primary" />
					</div>
					<h3 className="text-lg font-semibold">No webhook logs</h3>
					<p className="text-muted-foreground max-w-xs mx-auto">
						{statusFilter !== "all"
							? `No logs with "${statusFilter}" status found.`
							: "Webhook delivery logs will appear here once callbacks are triggered."}
					</p>
				</div>
			) : (
				<div className="grid gap-3">
					{logs.map((log, index) => {
						const config = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
						const StatusIcon = config.icon;
						const isLast = index === logs.length - 1;

						return (
							<Card
								ref={isLast ? lastLogRef : undefined}
								key={log._id}
								className="relative overflow-hidden group border border-muted-foreground/10 hover:border-primary/40 transition-all duration-300 bg-card/40 backdrop-blur-sm cursor-pointer"
								onClick={() => openDetail(log)}
							>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4">
									<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
										{/* Status Icon */}
										<div
											className={cn(
												"h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-inner transition-colors shrink-0",
												config.bg,
												config.color,
											)}
										>
											<StatusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2 flex-wrap">
												<span
													className={cn(
														"text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
														config.bg,
														config.color,
													)}
												>
													{config.label}
												</span>
												{log.order && (
													<span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
														{log.order.clientRef}
													</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px] font-mono">
												{log.url}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-x-10 gap-y-2 shrink-0">
										{log.order && (
											<div className="hidden md:block">
												<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
													Amount
												</p>
												<p className="text-base font-bold text-foreground/90">
													₹{log.order.amount?.toFixed(2)}
												</p>
											</div>
										)}
										<div className="hidden md:block">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
												Attempts
											</p>
											<p className="text-sm font-bold text-foreground/80">
												{log.attempts}
											</p>
										</div>
										<div className="hidden lg:block">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
												Date & Time
											</p>
											<p className="text-sm font-bold text-foreground/80">
												{formatDate(log.createdAt)}
											</p>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors hidden sm:block" />
									</div>
								</div>
							</Card>
						);
					})}

					{isFetchingMore && (
						<div className="py-4 flex justify-center w-full">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					)}
				</div>
			)}

			{/* Detail Dialog */}
			<Dialog open={showDetail} onOpenChange={setShowDetail}>
				<DialogContent className="w-[98vw] sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] overflow-y-auto">
					{selectedLog && (() => {
						const config = STATUS_CONFIG[selectedLog.status] || STATUS_CONFIG.pending;
						const StatusIcon = config.icon;

						return (
							<div className="flex flex-col">
								{/* Header */}
								<div className={cn("h-20 sm:h-24 px-4 sm:px-6 flex items-center gap-3 sm:gap-4", config.bg)}>
									<div className={cn(
										"h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shadow-sm text-white",
										selectedLog.status === "success" ? "bg-green-500" :
										selectedLog.status === "pending" ? "bg-amber-500" :
										selectedLog.status === "retry" ? "bg-blue-500" :
										"bg-red-500"
									)}>
										<StatusIcon className="h-6 w-6 sm:h-8 sm:w-8" />
									</div>
									<div>
										<h2 className="text-xl sm:text-2xl font-black tracking-tight">
											Webhook {config.label}
										</h2>
										<p className={cn(
											"text-[10px] font-black uppercase tracking-[0.2em] opacity-80",
											config.color,
										)}>
											Attempt {selectedLog.attempts} of 5
										</p>
									</div>
								</div>

								<div className="p-6 space-y-6">
									{/* Info Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
										<div className="space-y-1">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
												Delivery URL
											</p>
											<div
												className="flex items-center gap-2 group cursor-pointer"
												onClick={() => {
													navigator.clipboard.writeText(selectedLog.url);
													toast.success("URL copied");
												}}
											>
												<p className="text-sm font-bold truncate max-w-[220px] font-mono">
													{selectedLog.url}
												</p>
												<Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
												Created At
											</p>
											<p className="text-sm font-bold">
												{formatDate(selectedLog.createdAt)}
											</p>
										</div>
										{selectedLog.order && (
											<>
												<div className="space-y-1">
													<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
														Order Reference
													</p>
													<div
														className="flex items-center gap-2 group cursor-pointer"
														onClick={() => {
															navigator.clipboard.writeText(selectedLog.order.clientRef);
															toast.success("Reference copied");
														}}
													>
														<p className="text-sm font-bold truncate max-w-[140px]">
															{selectedLog.order.clientRef}
														</p>
														<Copy className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
													</div>
												</div>
												<div className="space-y-1">
													<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
														Amount
													</p>
													<p className="text-lg font-bold">
														₹{selectedLog.order.amount?.toFixed(2)}
													</p>
												</div>
											</>
										)}
										<div className="space-y-1">
											<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
												Attempts
											</p>
											<p className="text-sm font-bold">{selectedLog.attempts}</p>
										</div>
										{selectedLog.nextRetryAt && (
											<div className="space-y-1">
												<p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
													Next Retry
												</p>
												<p className="text-sm font-bold">
													{formatDate(selectedLog.nextRetryAt)}
												</p>
											</div>
										)}
									</div>

									{/* Payload */}
									{selectedLog.payload && (
										<div className="rounded-2xl border border-muted/50 overflow-hidden bg-muted/5">
											<div className="px-4 py-2 border-b border-muted/50 bg-muted/10 flex items-center justify-between">
												<p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-[0.2em]">
													Request Payload
												</p>
												<Button
													variant="ghost"
													size="sm"
													className="h-7 text-[10px] uppercase tracking-widest font-bold"
													onClick={() => {
														navigator.clipboard.writeText(
															JSON.stringify(selectedLog.payload, null, 2),
														);
														toast.success("Payload copied");
													}}
												>
													<Copy className="h-3 w-3 mr-1" />
													Copy
												</Button>
											</div>
											<pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed">
												{JSON.stringify(selectedLog.payload, null, 2)}
											</pre>
										</div>
									)}

									{/* Retry Now Button */}
									{selectedLog.status === "retry" && (
										<Button
											className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
											disabled={retrying}
											onClick={() => handleRetryNow(selectedLog._id)}
										>
											{retrying ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Retrying...
												</>
											) : (
												<>
													<RefreshCw className="h-4 w-4 mr-2" />
													Retry Now
												</>
											)}
										</Button>
									)}
								</div>
							</div>
						);
					})()}
				</DialogContent>
			</Dialog>
		</div>
	);
}
