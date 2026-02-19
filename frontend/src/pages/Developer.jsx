import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, RefreshCw, Key, Loader2, AlertTriangle, Save, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Developer() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [regeneratingApi, setRegeneratingApi] = useState(false);
	const [regeneratingWebhook, setRegeneratingWebhook] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmType, setConfirmType] = useState(null); // 'api' or 'webhook'
	const [callbackUrl, setCallbackUrl] = useState("");
	const [savingCallback, setSavingCallback] = useState(false);

	const fetchDetailedProfile = async () => {
		try {
			const { data } = await API.get("/user/detailed-profile");
			setUser(data.data);
			setCallbackUrl(data.data.callbackUrl || "");
		} catch (error) {
			toast.error("Failed to fetch developer details");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDetailedProfile();
	}, []);

	const copyToClipboard = (text, label) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	const handleRegenerateClick = (type) => {
		setConfirmType(type);
		setShowConfirmDialog(true);
	};

	const confirmRegeneration = () => {
		setShowConfirmDialog(false);
		if (confirmType === 'api') {
			executeRegenerateApiKey();
		} else {
			executeRegenerateWebhookSecret();
		}
	};

	const executeRegenerateApiKey = async () => {
		setRegeneratingApi(true);
		try {
			const { data } = await API.post("/user/generate-api-key");
			setUser(prev => ({ ...prev, apiKey: data.data.apiKey }));
			toast.success("New API Key generated");
		} catch (error) {
			toast.error("Failed to generate API Key");
		} finally {
			setRegeneratingApi(false);
		}
	};

	const executeRegenerateWebhookSecret = async () => {
		setRegeneratingWebhook(true);
		try {
			const { data } = await API.post("/user/generate-webhook-secret");
			setUser(prev => ({ ...prev, webhookSecret: data.data.webhookSecret }));
			toast.success("New Webhook Secret generated");
		} catch (error) {
			toast.error("Failed to generate Webhook Secret");
		} finally {
			setRegeneratingWebhook(false);
		}
	};

	const handleSaveCallback = async () => {
		const trimmedUrl = callbackUrl.trim();
		
		// If not empty, validate URL format
		if (trimmedUrl !== "") {
			try {
				const url = new URL(trimmedUrl);
				if (url.protocol !== "http:" && url.protocol !== "https:") {
					return toast.error("Callback URL must use http or https protocol");
				}
			} catch (err) {
				return toast.error("Please enter a valid URL (e.g., https://example.com/webhook)");
			}
		}

		setSavingCallback(true);
		try {
			await API.put("/user/profile", { callbackUrl: trimmedUrl });
			setUser(prev => ({ ...prev, callbackUrl: trimmedUrl }));
			setCallbackUrl(trimmedUrl); // Update local state with trimmed version
			toast.success("Callback URL updated successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update callback URL");
		} finally {
			setSavingCallback(false);
		}
	};

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
				<h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
				<p className="text-muted-foreground">Manage your API keys and webhook secrets for integration.</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Developer Credentials */}
				<Card className="border-border/40 bg-card/60 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Key className="h-5 w-5 text-primary" />
							Developer Keys
						</CardTitle>
						<CardDescription>Used to authenticate your API requests and verify webhooks.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* API Key */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">API Key</p>
								<Button 
									variant="ghost" 
									size="sm" 
									className="h-8 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary"
									onClick={() => copyToClipboard(user?.apiKey, "API Key")}
								>
									<Copy className="h-3 w-3 mr-2" />
									Copy Key
								</Button>
							</div>
							<div className="flex gap-2">
								<Input 
									readOnly 
									value={user?.apiKey || ""} 
									className="font-mono text-xs bg-muted/30 border-muted-foreground/20"
								/>
								<Button 
									variant="outline" 
									size="icon" 
									disabled={regeneratingApi}
									onClick={() => handleRegenerateClick('api')}
									className="flex-shrink-0"
								>
									<RefreshCw className={`h-4 w-4 ${regeneratingApi ? 'animate-spin' : ''}`} />
								</Button>
							</div>
						</div>

						{/* Webhook Secret */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Webhook Secret</p>
								<Button 
									variant="ghost" 
									size="sm" 
									className="h-8 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary"
									onClick={() => copyToClipboard(user?.webhookSecret, "Webhook Secret")}
								>
									<Copy className="h-3 w-3 mr-2" />
									Copy Secret
								</Button>
							</div>
							<div className="flex gap-2">
								<Input 
									readOnly 
									value={user?.webhookSecret || ""} 
									className="font-mono text-xs bg-muted/30 border-muted-foreground/20"
								/>
								<Button 
									variant="outline" 
									size="icon" 
									disabled={regeneratingWebhook}
									onClick={() => handleRegenerateClick('webhook')}
									className="flex-shrink-0"
								>
									<RefreshCw className={`h-4 w-4 ${regeneratingWebhook ? 'animate-spin' : ''}`} />
								</Button>
							</div>
						</div>

						{/* Callback URL */}
						<div className="space-y-3 pt-4 border-t border-border/40">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Globe className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Webhook Callback URL</p>
								</div>
								{user?.callbackUrl !== callbackUrl && (
									<span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Unsaved Changes</span>
								)}
							</div>
							<div className="flex gap-2">
								<Input 
									placeholder="https://your-api.com/webhooks/payping"
									value={callbackUrl} 
									onChange={(e) => setCallbackUrl(e.target.value)}
									className="text-sm bg-muted/30 border-muted-foreground/20"
								/>
								<Button 
									variant="secondary" 
									className="flex-shrink-0 font-bold uppercase text-[10px] tracking-widest h-10 px-4"
									disabled={savingCallback || user?.callbackUrl === callbackUrl}
									onClick={handleSaveCallback}
								>
									{savingCallback ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />}
									Save
								</Button>
							</div>
							<p className="text-[10px] text-muted-foreground leading-relaxed">
								We will send POST requests to this URL whenever a payment status is updated.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Confirmation Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border shadow-none duration-0 animate-none">
					<div className="bg-destructive/10 p-6 flex items-center gap-4 border-b border-destructive/20">
						<div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center text-white shrink-0">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-xl font-bold text-destructive">
								Reset {confirmType === 'api' ? 'API Key' : 'Webhook Secret'}?
							</DialogTitle>
							<p className="text-xs text-destructive/70 font-bold uppercase tracking-widest mt-0.5">Critical Action</p>
						</div>
					</div>
					
					<div className="p-6 space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-bold text-foreground/90">
								Are you sure you want to regenerate your {confirmType === 'api' ? 'API Key' : 'Webhook Secret'}?
							</p>
							<ul className="text-xs space-y-2 text-muted-foreground bg-muted/30 p-4 rounded-xl border border-muted/50">
								<li className="flex items-start gap-2">
									<div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1 shrink-0" />
									<span>Existing {confirmType === 'api' ? 'API Key' : 'Webhook Secret'} will stop working immediately.</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1 shrink-0" />
									<span>All production traffic using this credential will fail.</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1 shrink-0" />
									<span>This action cannot be undone.</span>
								</li>
							</ul>
						</div>

						<div className="flex gap-3 pt-2">
							<Button 
								variant="outline" 
								className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest"
								onClick={() => setShowConfirmDialog(false)}
							>
								Cancel
							</Button>
							<Button 
								variant="destructive" 
								className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest"
								onClick={confirmRegeneration}
							>
								Yes, Regenerate
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
