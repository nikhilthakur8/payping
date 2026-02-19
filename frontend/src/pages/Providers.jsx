import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, X, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";

export default function Providers() {
	const [accounts, setAccounts] = useState([]);
	const [allProviders, setAllProviders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [editingAccount, setEditingAccount] = useState(null);

	// Add form state
	const [selectedProvider, setSelectedProvider] = useState("");
	const [merchantId, setMerchantId] = useState("");
	const [vpa, setVpa] = useState("");
	const [isDefault, setIsDefault] = useState(false);

	async function fetchAccounts() {
		try {
			const { data } = await API.get("/provider/");
			setAccounts(data.data);
		} catch (error) {
			toast.error(
				error.response?.data?.message ||
					"Failed to fetch provider accounts",
			);
		} finally {
			setLoading(false);
		}
	}

	async function fetchAllProviders() {
		try {
			const { data } = await API.get("/provider/all-providers");
			setAllProviders(data.data);
		} catch (error) {
			toast.error(
				error.response?.data?.message || "Failed to fetch providers",
			);
		}
	}

	useEffect(() => {
		fetchAccounts();
	}, []);

	function openAddForm() {
		fetchAllProviders();
		setShowAddForm(true);
		setSelectedProvider("");
		setMerchantId("");
		setVpa("");
		setIsDefault(false);
	}

	async function handleAdd(e) {
		e.preventDefault();
		if (!selectedProvider) {
			toast.error("Please select a provider");
			return;
		}
		if (!merchantId || merchantId.length < 1) {
			toast.error("Merchant ID is required");
			return;
		}
		if (!vpa || vpa.length < 3) {
			toast.error("VPA must be at least 3 characters");
			return;
		}

		setSaving(true);
		try {
			await API.post("/provider/", {
				provider: selectedProvider,
				merchantId: merchantId || undefined,
				vpa,
				isDefault,
			});
			toast.success("Provider account added");
			setShowAddForm(false);
			await fetchAccounts();
		} catch (error) {
			toast.error(
				error.response?.data?.message ||
					"Failed to add provider account",
			);
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(id) {
		setDeletingId(id);
		try {
			await API.delete(`/provider/${id}`);
			toast.success("Provider account removed");
			await fetchAccounts();
		} catch (error) {
			toast.error(
				error.response?.data?.message ||
					"Failed to delete provider account",
			);
		} finally {
			setDeletingId(null);
		}
	}

	function EditProviderForm({ account, onUpdated }) {
		const [merchantId, setMerchantId] = useState(account.merchantId || "");
		const [vpa, setVpa] = useState(account.vpa || "");
		const [isDefault, setIsDefault] = useState(account.isDefault || false);
		const [saving, setSaving] = useState(false);

		async function handleEdit(e) {
			e.preventDefault();
			if (!merchantId || merchantId.length < 1) {
				toast.error("Merchant ID is required");
				return;
			}
			if (!vpa || vpa.length < 3) {
				toast.error("VPA must be at least 3 characters");
				return;
			}
			setSaving(true);
			try {
				await API.put(`/provider/${account._id}`, {
					merchantId,
					vpa,
					isDefault,
				});
				toast.success("Provider account updated");
				if (onUpdated) onUpdated();
			} catch (error) {
				toast.error(
					error.response?.data?.message ||
						"Failed to update provider account",
				);
			} finally {
				setSaving(false);
			}
		}

		return (
			<form onSubmit={handleEdit} className="grid gap-6 pt-4">
				<div className="space-y-2">
					<Label className="text-foreground/70">Provider</Label>
					<Input
						value={account.provider?.name || ""}
						disabled
						className="rounded-lg bg-muted/40 border-muted-foreground/20 text-foreground"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="merchantId" className="text-foreground/90 font-medium">
						Merchant ID <span className="text-destructive">*</span>
					</Label>
					<Input
						id="merchantId"
						value={merchantId}
						onChange={(e) => setMerchantId(e.target.value)}
						required
						autoComplete="off"
						className="rounded-lg border-muted-foreground/20 focus:border-primary transition-all"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="vpa" className="text-foreground/90 font-medium">
						VPA <span className="text-destructive">*</span>
					</Label>
					<Input
						id="vpa"
						value={vpa}
						onChange={(e) => setVpa(e.target.value)}
						required
						autoComplete="off"
						className="rounded-lg border-muted-foreground/20 focus:border-primary transition-all"
					/>
				</div>
				<div className="flex items-center gap-3 py-2 px-1">
					<Checkbox
						id="isDefaultEdit"
						checked={isDefault}
						onCheckedChange={setIsDefault}
						className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
					/>
					<Label
						htmlFor="isDefaultEdit"
						className="text-sm cursor-pointer select-none font-medium text-foreground/80 hover:text-foreground transition-colors"
					>
						Set as default
					</Label>
				</div>
				<DialogFooter className="gap-2 pt-4">
					<DialogClose asChild>
						<Button type="button" variant="outline" className="flex-1 sm:flex-none">
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit" disabled={saving} className="flex-1 sm:flex-none">
						{saving ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</form>
		);
	}

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">Providers</h1>
				<p className="text-muted-foreground mt-4">Loading...</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Providers</h1>
					<p className="text-muted-foreground mt-1">Manage your payment gateway configurations</p>
				</div>
				{!showAddForm && (
					<Button onClick={openAddForm}>
						<Plus className="mr-1.5 h-4 w-4" />
						Add Provider
					</Button>
				)}
			</div>

			{/* Add Provider Form */}
			{showAddForm && (
				<Card className="mb-8 overflow-hidden bg-card/60 backdrop-blur-sm border-muted-foreground/10">
					<CardHeader className="flex flex-row items-center justify-between border-b border-muted/30 pb-4">
						<div>
							<CardTitle className="text-lg font-bold">
								Add Provider Account
							</CardTitle>
							<CardDescription className="text-muted-foreground/80">
								Link a new payment provider to your account
							</CardDescription>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowAddForm(false)}
							className="rounded-full hover:bg-muted/50"
						>
							<X className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="pt-6">
						<form
							onSubmit={handleAdd}
							className="grid gap-6 sm:grid-cols-2"
						>
							<div className="space-y-2">
								<Label className="text-foreground/90 font-medium">
									Provider{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Select
									value={selectedProvider}
									onValueChange={setSelectedProvider}
								>
									<SelectTrigger className="w-full rounded-lg border-muted-foreground/20">
										<SelectValue placeholder="Select a provider" />
									</SelectTrigger>
									<SelectContent>
										{allProviders.map((p) => (
											<SelectItem
												key={p._id}
												value={p._id}
											>
												{p.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="merchantId" className="text-foreground/90 font-medium">
									Merchant ID{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="merchantId"
									value={merchantId}
									onChange={(e) =>
										setMerchantId(e.target.value)
									}
									placeholder="Your merchant ID"
									required
									autoComplete="off"
									className="rounded-lg border-muted-foreground/20 focus:border-primary transition-all"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="vpa" className="text-foreground/90 font-medium">
									VPA{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="vpa"
									value={vpa}
									onChange={(e) => setVpa(e.target.value)}
									placeholder="e.g. merchant@upi"
									required
									autoComplete="off"
									className="rounded-lg border-muted-foreground/20 focus:border-primary transition-all"
								/>
							</div>

							<div className="flex items-center gap-3 pt-2">
								<Checkbox
									id="isDefault"
									checked={isDefault}
									onCheckedChange={setIsDefault}
									className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
								/>
								<Label
									htmlFor="isDefault"
									className="text-sm cursor-pointer select-none font-medium text-foreground/80 hover:text-foreground transition-colors"
								>
									Set as default
								</Label>
							</div>

							<div className="sm:col-span-2 pt-2">
								<Button
									type="submit"
									disabled={saving}
									className="w-full sm:w-auto px-8"
								>
									{saving ? "Saving..." : "Save Provider"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Provider Accounts List */}
			{accounts.length === 0 ? (
				<p className="text-muted-foreground">
					No provider accounts linked yet. Add one to get started.
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{accounts.map((account) => (
						<Card
							key={account._id}
							onClick={() => setEditingAccount(account)}
							className="relative overflow-hidden cursor-pointer transition-all duration-300 border border-transparent hover:border-muted-foreground/20 group bg-card/60 backdrop-blur-sm"
						>
							{account.isDefault && (
								<div className="absolute top-0 right-0">
									<div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
										Default
									</div>
								</div>
							)}
							<CardHeader className="flex flex-row items-center gap-4 pb-4">
								<div className="h-14 w-14 rounded-xl bg-muted/30 border border-muted-foreground/10 flex items-center justify-center overflow-hidden p-2 transition-transform duration-300">
									{account.provider?.providerPhoto ? (
										<img
											src={
												account.provider
													.providerPhoto
											}
											alt={account.provider.name}
											className="h-full w-full object-contain"
										/>
									) : (
										<div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
											{account.provider?.name?.charAt(0) || "P"}
										</div>
									)}
								</div>
								<div className="flex-1">
									<CardTitle className="text-lg font-bold text-foreground">
										{account.provider?.name ||
											"Unknown"}
									</CardTitle>
									<p className="text-xs font-medium text-muted-foreground mt-0.5 tracking-widest uppercase opacity-70">
										{account.provider?.code}
									</p>
								</div>
							</CardHeader>
							<CardContent className="space-y-3 pb-6">
								<div className="space-y-1.5">
									{account.merchantId && (
										<div className="flex flex-col">
											<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Merchant ID</span>
											<span className="text-sm font-mono font-medium text-foreground/90 break-all">
												{account.merchantId}
											</span>
										</div>
									)}
									<div className="flex flex-col pt-1">
										<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">VPA Address</span>
										<span className="text-sm font-mono font-medium text-foreground/90 break-all">
											{account.vpa}
										</span>
									</div>
								</div>
								<div className="pt-4 flex items-center justify-between border-t border-muted/30 mt-4">
									<span className="text-xs text-muted-foreground group-hover:text-primary transition-colors cursor-pointer font-medium">Click to edit</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(account._id);
										}}
										disabled={
											deletingId === account._id
										}
									>
										<Trash2 className="h-4 w-4" />
										{deletingId === account._id && (
											<span className="sr-only">Removing...</span>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader className="space-y-3">
						<DialogTitle className="text-2xl font-bold tracking-tight">
							Edit Provider Account
						</DialogTitle>
						<DialogDescription className="text-muted-foreground/90 text-sm">
							Manage your credentials and default settings for this provider.
						</DialogDescription>
					</DialogHeader>
					{editingAccount && (
						<EditProviderForm
							account={editingAccount}
							onUpdated={() => {
								fetchAccounts();
								setEditingAccount(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
