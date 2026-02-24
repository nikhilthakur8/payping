import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
	TrendingUp, 
	CheckCircle2, 
	AlertCircle, 
	Clock, 
	IndianRupee, 
	Loader2, 
	ArrowUpRight,
	BarChart3,
	ShieldCheck
} from "lucide-react";
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	ResponsiveContainer,
	Cell
} from 'recharts';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Dashboard() {
	const { user } = useAppContext();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchStats = async () => {
		try {
			const { data } = await API.get("/payment/stats");
			setStats(data.data);
		} catch (error) {
			toast.error("Failed to fetch dashboard statistics");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const { stats: s, chartData, defaultAccount } = stats || { stats: {}, chartData: [], defaultAccount: null };

	return (
		<div className="w-full max-w-7xl mx-auto px-1 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
			<div className="px-3 sm:px-0">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
				<p className="text-muted-foreground text-sm sm:text-base">Welcome back, {user?.name}. Here's what's happening with your payments.</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-3 sm:px-0">
				<Card className="border-border/40 bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all duration-300">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Collection</CardTitle>
						<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							<IndianRupee className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold tracking-tight">₹{s.totalCollection?.toFixed(2)}</div>
						<p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-bold">
							<ArrowUpRight className="h-3 w-3 text-green-500" />
							Success transactions
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/40 bg-card/60 backdrop-blur-sm group hover:border-green-500/40 transition-all duration-300">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Successful</CardTitle>
						<div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
							<CheckCircle2 className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold tracking-tight">{s.successCount}</div>
						<p className="text-[10px] text-muted-foreground mt-1 font-bold">Settled orders</p>
					</CardContent>
				</Card>

				<Card className="border-border/40 bg-card/60 backdrop-blur-sm group hover:border-amber-500/40 transition-all duration-300">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Pending</CardTitle>
						<div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
							<Clock className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold tracking-tight">{s.pendingCount}</div>
						<p className="text-[10px] text-muted-foreground mt-1 font-bold">Waiting for payment</p>
					</CardContent>
				</Card>

				<Card className="border-border/40 bg-card/60 backdrop-blur-sm group hover:border-destructive/40 transition-all duration-300">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Failed</CardTitle>
						<div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
							<AlertCircle className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold tracking-tight">{s.failedCount}</div>
						<p className="text-[10px] text-muted-foreground mt-1 font-bold">Expired or cancelled</p>
					</CardContent>
				</Card>
			</div>

			{/* Chart & Activity */}
			<div className="grid gap-6 md:grid-cols-7">
				<Card className="md:col-span-4 border-border/40 bg-card/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
							<BarChart3 className="h-4 w-4" />
						</div>
						<div>
							<CardTitle className="text-lg">Collections Trend</CardTitle>
							<CardDescription>Daily successful transaction volume (Last 7 Days)</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="h-[220px] sm:h-[300px] w-full pt-4 px-1 sm:px-4">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
								<XAxis 
									dataKey="date" 
									axisLine={false} 
									tickLine={false} 
									tick={{fontSize: 9, fontWeight: 700}}
									tickFormatter={(value) => {
										const d = new Date(value);
										return d.toLocaleDateString(undefined, { weekday: 'short' });
									}}
								/>
								<YAxis 
									axisLine={false} 
									tickLine={false} 
									tick={{fontSize: 10, fontWeight: 700}}
									tickFormatter={(value) => `₹${value}`}
								/>
								<Tooltip 
									cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											return (
												<div className="bg-card/90 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-2xl">
													<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
														{new Date(payload[0].payload.date).toLocaleDateString(undefined, { 
															weekday: 'long', 
															month: 'short', 
															day: 'numeric' 
														})}
													</p>
													<div className="flex items-center gap-2">
														<div className="h-2 w-2 rounded-full bg-primary" />
														<p className="text-sm font-bold text-foreground">
															₹{payload[0].value.toLocaleString()}
														</p>
													</div>
													<p className="text-[9px] font-bold text-muted-foreground mt-1">
														{payload[0].payload.count} Successful Orders
													</p>
												</div>
											);
										}
										return null;
									}}
								/>
								<Bar 
									dataKey="amount" 
									radius={[4, 4, 0, 0]}
									fill="currentColor"
									className="text-primary"
								>
									{chartData.map((entry, index) => (
										<Cell 
											key={`cell-${index}`} 
											fillOpacity={index === chartData.length - 1 ? 1 : 0.6}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Default Provider Card */}
				<Card className="md:col-span-3 border-border/40 bg-card/60 backdrop-blur-sm">
					<CardHeader className="flex flex-row items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
							<ShieldCheck className="h-4 w-4" />
						</div>
						<div>
							<CardTitle className="text-lg">Active Provider</CardTitle>
							<CardDescription>Primary routing for your payments</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-6 pt-2">
						{stats?.defaultAccount ? (
							<>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/20 border border-muted/50 gap-3">
									<div className="flex items-center gap-4">
										<div className="h-12 w-12 rounded-xl bg-background border border-muted/50 flex items-center justify-center p-2 overflow-hidden">
											{stats.defaultAccount.provider?.providerPhoto ? (
												<img 
													src={stats.defaultAccount.provider.providerPhoto} 
													alt="" 
													className="w-full h-full object-contain" 
												/>
											) : (
												<ShieldCheck className="h-6 w-6 text-muted-foreground" />
											)}
										</div>
										<div className="space-y-1">
											<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provider</p>
											<p className="text-sm font-bold">{stats.defaultAccount.provider?.name}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
										<span className="text-[10px] bg-green-500/10 text-green-600 font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
									</div>
								</div>

								<div className="space-y-4">
									<h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">Account Details</h4>
									<div className="space-y-4">
										<div className="space-y-1">
											<p className="text-[10px] font-bold text-muted-foreground">VPA / UPI ID</p>
											<p className="text-sm font-mono font-bold">{stats.defaultAccount.vpa}</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1">
												<p className="text-[10px] font-bold text-muted-foreground">Merchant ID</p>
												<p className="text-sm font-mono font-bold truncate">{stats.defaultAccount.merchantId}</p>
											</div>
											<div className="space-y-1">
												<p className="text-[10px] font-bold text-muted-foreground">Business Name</p>
												<p className="text-sm font-bold truncate">{stats.defaultAccount.businessName || user?.name}</p>
											</div>
										</div>
									</div>
								</div>
							</>
						) : (
							<div className="py-10 text-center space-y-3">
								<p className="text-sm text-muted-foreground">No default provider set</p>
								<p className="text-[10px] text-muted-foreground">Please configure a provider in settings to start accepting payments.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
