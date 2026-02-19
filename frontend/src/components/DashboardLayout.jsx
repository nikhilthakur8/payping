import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
	Settings,
	Wallet,
	ShoppingCart,
	LayoutDashboard,
	PanelLeft,
	FileText,
	Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarLinks = [
	{ to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
	{ to: "/dashboard/providers", label: "Provider", icon: Wallet },
	{ to: "/dashboard/orders", label: "Payment Order", icon: ShoppingCart },
	{ to: "/dashboard/api-docs", label: "API Docs", icon: FileText },
	{ to: "/dashboard/developer", label: "Developer", icon: Code },
	{ to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex min-h-screen relative">
			{/* Mobile Toggle Button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed bottom-4 right-4 z-50 md:hidden rounded-full h-12 w-12 shadow-lg bg-background"
				onClick={() => setSidebarOpen((prev) => !prev)}
			>
				<PanelLeft className="h-6 w-6" />
			</Button>

			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div 
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside 
				className={cn(
					"fixed top-14 bottom-0 left-0 z-40 w-56 border-r border-border/40 bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-x-0 pt-6 px-4",
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<nav className="flex flex-col gap-2">
					<div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
						Menu
					</div>
					{[
						{ to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
						{ to: "/dashboard/providers", label: "Providers", icon: Wallet },
						{ to: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
						{ to: "/dashboard/api-docs", label: "API Reference", icon: FileText },
						{ to: "/dashboard/developer", label: "Developer", icon: Code },
						{ to: "/dashboard/settings", label: "Settings", icon: Settings },
					].map(({ to, label, icon: Icon, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							onClick={() => setSidebarOpen(false)}
							className={({ isActive }) =>
								cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
									isActive 
										? "bg-primary/10 text-primary" 
										: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
								)
							}
						>
							<Icon className="h-4 w-4" />
							{label}
						</NavLink>
					))}
				</nav>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 md:ml-56 min-h-screen">
				<div className="container max-w-7xl mx-auto p-4 md:p-8 pt-6">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
