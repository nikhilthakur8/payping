import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
	Settings,
	Wallet,
	ShoppingCart,
	LayoutDashboard,
	FileText,
	Code,
	LogOut,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
	const navigate = useNavigate();
	const { logout, sidebarOpen, setSidebarOpen } = useAppContext();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="flex min-h-screen relative">
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
					"fixed top-14 bottom-0 left-0 z-40 w-56 border-r border-border/40 bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-x-0 pt-6 px-4 flex flex-col justify-between pb-6",
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<nav className="flex flex-col gap-1.5">
					<div className="px-3 mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
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
									"flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border border-transparent",
									isActive 
										? "bg-secondary text-foreground shadow-sm border-border/50" 
										: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
								)
							}
						>
							<Icon className="h-[18px] w-[18px]" />
							{label}
						</NavLink>
					))}
				</nav>

				<div className="pt-4 border-t border-border/40">
					<button
						onClick={() => {
							handleLogout();
							setSidebarOpen(false);
						}}
						className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
					>
						<LogOut className="h-[18px] w-[18px]" />
						Logout
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 md:ml-56 min-h-screen overflow-x-hidden">
				<div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
