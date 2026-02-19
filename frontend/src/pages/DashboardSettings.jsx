import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettings() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = async () => {
		try {
			const { data } = await API.get("/user/profile");
			setUser(data.data);
		} catch (error) {
			toast.error("Failed to fetch profile");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">Manage your account information.</p>
			</div>

			<div className="space-y-6">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Basic Profile */}
					<Card className="border-border/40 bg-card/60 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-lg">Account Profile</CardTitle>
							<CardDescription>Your basic account information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1">
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</p>
								<p className="text-sm font-bold">{user?.name}</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</p>
								<p className="text-sm font-bold">{user?.email}</p>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</p>
									<div className="flex items-center gap-1.5">
										<div className={`h-2 w-2 rounded-full ${user?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
										<p className="text-sm font-bold capitalize">{user?.status}</p>
									</div>
								</div>
								<div className="space-y-1 text-right">
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Verification</p>
									<div className="flex items-center gap-1.5 justify-end">
										{user?.isVerified ? (
											<>
												<p className="text-sm font-bold text-green-600">Verified</p>
												<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
											</>
										) : (
											<p className="text-sm font-bold text-amber-600">Pending</p>
										)}
									</div>
								</div>
							</div>
							<div className="pt-2">
								<p className="text-sm font-bold text-muted-foreground/85">Member since {new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
