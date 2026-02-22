import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
	Terminal, 
	Key, 
	Webhook, 
	ArrowRight, 
	CheckCircle2, 
	Clock,
	Copy, 
	ExternalLink,
	Info,
	AlertCircle 	
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CodeBlock = ({ code, language = "json" }) => {
	const copy = () => {
		navigator.clipboard.writeText(code);
		toast.success("Code copied to clipboard");
	};

	return (
		<div className="relative group mt-3">
			<pre className="p-4 rounded-xl bg-muted/60 font-mono text-sm overflow-x-auto border border-border/50 leading-relaxed text-foreground/90">
				<code>{code}</code>
			</pre>
			<Button
				size="icon"
				variant="ghost"
				className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background"
				onClick={copy}
			>
				<Copy className="h-4 w-4" />
			</Button>
		</div>
	);
};

const SectionHeader = ({ icon: Icon, title, description, badge, iconColor = "text-primary", iconBg = "bg-primary/10", badgeClass }) => (
	<div className="flex items-center justify-between w-full pr-4 text-left group gap-2">
		<div className="flex items-center gap-3 min-w-0">
			<div className={cn("h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-colors shrink-0", iconBg, iconColor)}>
				<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
			</div>
			<div className="min-w-0">
				<h2 className={cn("text-base sm:text-lg font-extrabold tracking-tight transition-colors group-hover:text-foreground/80")}>{title}</h2>
				<p className="text-xs sm:text-sm text-muted-foreground font-normal hidden sm:block">{description}</p>
			</div>
		</div>
		{badge && (
			<span className={cn(
				"text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border whitespace-nowrap ml-2",
				badgeClass || "bg-primary/10 text-primary border-primary/20"
			)}>
				{badge}
			</span>
		)}
	</div>
);

export default function ApiDocs() {
	const { user } = useAppContext();
	const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
	
	const [openItem, setOpenItem] = useState("authentication");

	const handleScrollTo = (id) => {
		if (openItem !== id) {
			setOpenItem(id);
		}
		
		setTimeout(() => {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				// adjusting for sticky header/padding if needed could be done here, 
				// but scrollIntoView is safer than manual calculation during layout shifts
			}
		}, 300);
	};

	const sidebarLinks = [
		{ id: "authentication", label: "Authentication", activeColor: "border-blue-500 text-blue-600" },
		{ id: "create-order", label: "Create Order", activeColor: "border-green-500 text-green-600" },
		{ id: "order-status", label: "Check Status", activeColor: "border-amber-500 text-amber-600" },
		{ id: "webhooks", label: "Webhooks", activeColor: "border-purple-500 text-purple-600" },
	];

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 pb-20">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">API Reference</h1>
				<p className="text-muted-foreground mt-1">
					Build powerful payment experiences with the PayPing API. Simple, secure, and developer-friendly.
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-12">
				{/* Main Content */}
				<div className="flex-1 min-w-0">
					<Accordion 
						type="single" 
						collapsible
						value={openItem} 
						onValueChange={setOpenItem} 
						className="space-y-6"
					>
						{/* Authentication */}
						<AccordionItem value="authentication" id="authentication" className="border border-border/40 rounded-xl px-4 bg-card/40 backdrop-blur-sm">
							<AccordionTrigger className="hover:no-underline py-6">
								<SectionHeader 
									icon={Key} 
									title="Authentication" 
									description="How to secure your API requests" 
									iconColor="text-blue-500"
									iconBg="bg-blue-500/10"
								/>
							</AccordionTrigger>
							<AccordionContent className="pb-6 pl-1 pt-2">
								<Card className="bg-card/40 border-border/40 backdrop-blur-sm overflow-hidden">
									<CardContent className="p-6 space-y-4">
										<p className="text-base leading-relaxed text-muted-foreground">
											All merchant API requests must be authenticated using your unique <span className="font-bold text-foreground underline decoration-primary/30 decoration-2 text-lg">API Key</span>.
										</p>
										<div className="p-4 rounded-xl bg-muted/30 border border-border/50">
											<p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Required Header</p>
											<div className="flex items-center justify-between gap-4 py-2 border-b border-border/20">
												<code className="text-base font-black text-primary">x-api-key</code>
												<span className="text-sm text-muted-foreground italic truncate max-w-[200px]">{user?.apiKey || "YOUR_API_KEY"}</span>
											</div>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mt-2">
											<Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
											<p className="text-sm text-muted-foreground leading-relaxed">
												Keep your API key secret! If compromised, you can regenerate it anytime from the <a href="/dashboard/developer" className="text-primary font-bold hover:underline inline-flex items-center">Developer Settings <ArrowRight className="h-3 w-3 ml-1" /></a>.
											</p>
										</div>
									</CardContent>
								</Card>
							</AccordionContent>
						</AccordionItem>

						{/* Create Order */}
						<AccordionItem value="create-order" id="create-order" className="border border-border/40 rounded-xl px-4 bg-card/40 backdrop-blur-sm">
							<AccordionTrigger className="hover:no-underline py-6">
								<SectionHeader 
									icon={CheckCircle2} 
									title="Create Order" 
									description="Endpoint to initiate a new payment request" 
									badge="POST"
									iconColor="text-green-500"
									iconBg="bg-green-500/10"
									badgeClass="bg-green-500/10 text-green-600 border-green-500/20"
								/>
							</AccordionTrigger>
							<AccordionContent className="pb-6 pl-1 pt-2">
								<div className="space-y-6">
									<div className="flex items-center gap-3 p-2 px-4 rounded-xl bg-muted/40 border border-border/50 w-full overflow-x-auto">
										<code className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">{baseUrl}/api/orders</code>
									</div>

									<div className="grid gap-4">
										<h3 className="text-base font-bold underline underline-offset-4 decoration-primary/30">Request Body</h3>
										<div className="grid gap-2 text-sm border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
											{[
												{ name: "amount", type: "float", required: true, desc: "Amount in INR (e.g., 50.00)" },
												{ name: "note", type: "string", required: false, desc: "Payment purpose shown to customer" },
												{ name: "clientRef", type: "string", required: true, desc: "Your internal reference ID (must be unique)" },
												{ name: "redirectUri", type: "string", required: false, desc: "URL to redirect user to after payment success" },
											].map((param) => (
												<div key={param.name} className="flex flex-col sm:flex-row p-4 bg-card/20 sm:items-center justify-between gap-1 sm:gap-4">
													<div className="flex items-center gap-3">
														<span className="font-bold font-mono text-primary text-sm sm:text-base">{param.name}</span>
														{param.required && <span className="text-destructive font-bold text-xs uppercase px-2 py-0.5 bg-destructive/5 rounded-md">Required</span>}
													</div>
													<span className="text-muted-foreground text-xs sm:text-sm sm:text-right italic">{param.desc}</span>
												</div>
											))}
										</div>
									</div>

									<div className="space-y-3">
										<h3 className="text-base font-bold flex items-center gap-2">
											<Terminal className="h-5 w-5 text-muted-foreground" />
											JSON Example
										</h3>
										<CodeBlock code={`// POST ${baseUrl}/api/orders\n{\n  "amount": 25.50,\n  "note": "Subscription Payment",\n  "clientRef": "INV-2024-001",\n  "redirectUri": "https://yourwebsite.com/payment/success"\n}`} />
									</div>

									<div className="space-y-4">
										<h3 className="text-base font-bold flex items-center gap-2">
											<ArrowRight className="h-5 w-5 text-muted-foreground" />
											Response Structure
										</h3>
										<CodeBlock code={`{\n  "status": "success",\n  "data": {\n    "amount": 25.50,\n    "upiLink": "${baseUrl}/payment/PAYPING000001",\n    "qrPayload": "upi://pay?...",\n      "clientRef": "INV-2024-001"\n  }\n}`} />
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Order Status */}
						<AccordionItem value="order-status" id="order-status" className="border border-border/40 rounded-xl px-4 bg-card/40 backdrop-blur-sm">
							<AccordionTrigger className="hover:no-underline py-6">
								<SectionHeader 
									icon={Clock} 
									title="Check Order Status" 
									description="Monitor the real-time status of a payment" 
									badge="GET"
									iconColor="text-amber-500"
									iconBg="bg-amber-500/10"
									badgeClass="bg-amber-500/10 text-amber-600 border-amber-500/20"
								/>
							</AccordionTrigger>
							<AccordionContent className="pb-6 pl-1 pt-2">
								<div className="space-y-6">
									<div className="flex items-center gap-3 p-2 px-4 rounded-xl bg-muted/40 border border-border/50 w-full overflow-x-auto">
										<code className="text-sm sm:text-base font-bold text-foreground whitespace-nowrap">{baseUrl}/api/status/:clientRef</code>
									</div>
									
									<p className="text-base text-muted-foreground leading-relaxed">
										Retrieve the status using your custom <code className="text-primary font-bold">clientRef</code> provided during order creation. You must pass your <code className="text-primary font-bold">x-api-key</code> in the headers to use this endpoint.
									</p>

									<div className="space-y-3">
										<h3 className="text-base font-bold underline underline-offset-4 decoration-primary/30">Success Response</h3>
										<CodeBlock code={`{\n  "status": "success", // success, pending, or failed\n  "utr": "4123...",\n  "txnID": "PAYPING000001",\n  "amount": 25.50,\n  "clientRef": "INV-2024-001",\n  "txnTime": "2024-02-19T14:30:00Z"\n}`} />
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Webhooks */}
						<AccordionItem value="webhooks" id="webhooks" className="border border-border/40 rounded-xl px-4 bg-card/40 backdrop-blur-sm">
							<AccordionTrigger className="hover:no-underline py-6">
								<SectionHeader 
									icon={Webhook} 
									title="Webhooks" 
									description="Receive real-time payment notifications" 
									iconColor="text-purple-500"
									iconBg="bg-purple-500/10"
								/>
							</AccordionTrigger>
							<AccordionContent className="pb-6 pl-1 pt-2">
								<div className="space-y-8">
									<Card className="bg-primary/[0.02] border-primary/20">
										<CardContent className="p-6">
											<div className="flex items-start gap-4">
												<Info className="h-6 w-6 text-primary shrink-0" />
												<div className="space-y-2">
													<p className="text-base font-bold">How it works</p>
													<p className="text-sm text-muted-foreground leading-relaxed">
														PayPing will send a <span className="font-bold">POST</span> request to your configured callback URL as soon as a payment reaches a terminal state (Success or Failed). 
														Configure your URL in the <a href="/dashboard/developer" className="text-primary font-bold hover:underline">Developer Panel</a>.
													</p>
												</div>
											</div>
										</CardContent>
									</Card>

									<div className="space-y-3">
										<h3 className="text-base font-bold underline underline-offset-4 decoration-primary/30">Webhook Signature Verification</h3>
										<p className="text-sm text-muted-foreground leading-relaxed mb-4">
											Every webhook request contains an <code className="text-primary font-bold">x-payping-signature</code> header. You should verify this signature using your <span className="font-bold italic">Webhook Secret</span> to ensure the request is genuine.
										</p>
										<CodeBlock language="javascript" code={`const crypto = require('crypto');\n\nconst signature = req.headers['x-payping-signature'];\nconst payload = JSON.stringify(req.body);\nconst expectedSignature = crypto\n  .createHmac('sha256', YOUR_WEBHOOK_SECRET)\n  .update(payload)\n  .digest('hex');\n\nif (signature === expectedSignature) {\n  // Request is valid, proceed with payment logic\n}`} />
									</div>

									<div className="space-y-3">
										<h3 className="text-base font-bold underline underline-offset-4 decoration-primary/30">Webhook Payload</h3>
										<CodeBlock code={`{\n  "status": "success",\n  "utr": "40921XX...",\n  "ref": "INV-2024-001",\n  "amount": 25.50,\n  "txnTime": "2024-02-19T14:31:00Z",\n  "provider": "Paytm"\n}`} />
									</div>

									<div className="flex items-center gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/20 mt-4">
										<AlertCircle className="h-5 w-5 text-destructive shrink-0" />
										<p className="text-sm text-destructive font-bold uppercase tracking-wide">
											Your server must respond with a 200 OK within 5 seconds to acknowledge receipt.
										</p>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				{/* Right Sidebar */}
				<div className="hidden lg:block w-64 shrink-0">
					<div className="sticky top-8 space-y-4 rounded-xl border border-border/40 p-4 bg-muted/10 backdrop-blur-sm">
						<h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 pl-2">On this page</h3>
						<div className="relative">
							{/* Decoration line */}
							<div className="absolute left-0 top-0 bottom-0 w-px bg-border/50 ml-0.5" />
							
							<div className="space-y-1">
								{sidebarLinks.map((link) => (
									<button
										key={link.id}
										onClick={() => handleScrollTo(link.id)}
										className={cn(
											"block w-full text-left pl-4 py-1.5 text-sm font-medium border-l-2 border-transparent transition-all hover:text-foreground",
											openItem === link.id
												? cn("font-bold", link.activeColor)
												: "text-muted-foreground hover:border-foreground/20"
										)}
									>
										{link.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
